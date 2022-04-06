// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// Bring in Phoenix channels client library:
import {Socket} from "phoenix"
import * as graph from "./graph.js"
import * as clusterNodes from "./cluster_nodes.js"
import * as time from "./time.js"
import * as chart from "./chart.js"
import * as console_dash from "./console.js"

// And connect to the path in "lib/dashboard_skitter_web/endpoint.ex". We pass the
// token for authentication. Read below how it should be used.
let socket = new Socket("/socket", {params: {token: window.userToken}})

document.addEventListener('visibilitychange', function (event){
  if(document.hidden){
    chart.changeVisibility(false);
  }else{
    chart.changeVisibility(true);
  }
})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "lib/dashboard_skitter_web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "lib/dashboard_skitter_web/templates/layout/app.html.heex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/3" function
// in "lib/dashboard_skitter_web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket, _connect_info) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1_209_600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, connect to the socket:
socket.connect()

// Now that you are connected, you can join channels with a topic.
// user topic
let channel = socket.channel("user", {})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

// Initialize the dashboard after joining the channel
channel.on("initialize", payload =>{
  console.log("Received initialization: ", payload.reply)
  const replyWorkers = payload.reply.workers;
  const replyComponents = payload.reply.components;
  const startTime = payload.reply.start_time;
  const isStarted = payload.reply.isStarted;
  const clusterNodesObj = payload.reply.cluster_nodes;
  const logs = payload.reply.logs.logs;

  //Add nodes to both graphs
  graph.addNodes(graph.workersGraph, replyWorkers, workerFormatNode, workerFormatNode);
  graph.addNodes(graph.componentsGraph, replyComponents, componentFormatNode, componentGroup);
  //Add edges between the nodes in both graphs
  initializeEdgesNodes(replyWorkers, graph.workersGraph);
  initializeEdgesNodes(replyComponents, graph.componentsGraph);
  //Initialize the detailed info for the cluster nodes
  clusterNodes.initializeClusterNodes(clusterNodesObj);
  time.initializeStartTime(startTime, isStarted);
  console_dash.addInfo(logs);
})

//Starts the timer when it receives a message that the workflow is started
channel.on("started", payload =>{
  time.started(payload.msg);
})

//Handles the message to add a new node the workers graph
channel.on("update_workers", payload =>{
  console.log("Received update worker: ", payload);
  let msg = payload.msg;
  graph.addNodes(graph.workersGraph, [msg], workerFormatNode, workerFormatNode);
})

//Handles the message to add a new edge the workers graph
channel.on("update_edges_workers", payload =>{
  console.log("Received update workers edge: ", payload);
  let msg = payload.msg;
  graph.addEdges(graph.workersGraph, msg.from, [msg.to]);
})

//Handles the message to add a new node the workflow graph
channel.on("update_components", payload =>{
  console.log("Received update components: ", payload);
  graph.addNodes(graph.componentsGraph, [payload.msg], componentFormatNode, componentGroup);
})

//Handles the message to add a edge node the workflow graph
channel.on("update_edges_components", payload =>{
  console.log("Received update components edge: ", payload);
  let msg = payload.msg;
  graph.addEdges(graph.componentsGraph, msg.from, [msg.to]);
})

//Handles the message to update the metrics
channel.on("update_metrics", payload =>{
  const msg = payload.msg;
  const metric = msg.metric;
  const name = msg.name;
  const detailedMem = msg.detailed_mem;
  clusterNodes.showStats(metric.cpu, metric.mem, name);
  clusterNodes.addMetricToNode(metric.cpu, metric.mem, metric.time, name);
  clusterNodes.addDetailedOverview(name, metric.mem, detailedMem);
})

//Handles the message to add a new log in the console
channel.on("add_log", payload =>{
  console_dash.addLog(payload.msg);
});

//Loops over each component/worker and takes the destinations of the edges out
function initializeEdgesNodes(nodes, graphNode){
  nodes.forEach((node) =>{
    graph.addEdges(graphNode, node.id, node.to);
  });
}

//Formatters to show the correct label on the nodes of a graph
function componentFormatNode(node){
  return node.id + "\n" + node.name;
}

function workerFormatNode(node){
  return node.name;
}

function componentGroup(node){
  return node.id;
}
export default socket
