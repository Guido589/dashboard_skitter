// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "assets/js/app.js".

// Bring in Phoenix channels client library:
import {Socket} from "phoenix"
import * as graph from "./graph.js"

// And connect to the path in "lib/dashboard_skitter_web/endpoint.ex". We pass the
// token for authentication. Read below how it should be used.
let socket = new Socket("/socket", {params: {token: window.userToken}})

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

channel.on("initialize", payload =>{
  console.log("Received initialization: ", payload)
  const replyWorkers = payload.reply.workers;
  const replyComponents = payload.reply.components;

  graph.addNodes(graph.workersGraph, replyWorkers);
  graph.addNodes(graph.componentsGraph, replyComponents);
  initialize_edges_workers(replyWorkers);
  initialize_edges_components(replyComponents);
})

channel.on("update_workers", payload =>{
  console.log("Received update worker: ", payload);
  let msg = payload.msg;
  addElemenToList("workers", templateWorkers(msg.name, msg.id));
  graph.addNodes(graph.workersGraph, [msg]);
})

channel.on("update_edges_workers", payload =>{
  console.log("Received update workers edge: ", payload);
  let msg = payload.msg;
  addElemenToList("edges", templateEdges(msg.from, msg.to));
  graph.addEdges(graph.workersGraph, msg.from, [msg.to]);
})

channel.on("update_components", payload =>{
  console.log("Received update components: ", payload);
  graph.addNodes(graph.componentsGraph, [payload.msg]);
})

channel.on("update_edges_components", payload =>{
  console.log("Received update components edge: ", payload);
  let msg = payload.msg;
  graph.addEdges(graph.componentsGraph, msg.from, [msg.to]);
})

function templateWorkers(name, id){
  return name + " ("+id+")";
}

function templateEdges(from, to){
  return "from " + from + " to "+to;
}

function addElemenToList(elementId, listItem){
  var el = document.getElementById(elementId);
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(listItem));
  el.appendChild(li);
}

function initialize_edges_components(components){
  components.forEach((component) =>{
    graph.addEdges(graph.componentsGraph, component.id, component.to);
  });
}

function initialize_edges_workers(workers){
  workers.forEach((worker) =>{
    worker.to.forEach((to) =>{
      addElemenToList("edges", templateEdges(worker.id, to));
    });
    graph.addEdges(graph.workersGraph, worker.id, worker.to);
    addElemenToList("workers", templateWorkers(worker.name, worker.id));
  });
}
export default socket
