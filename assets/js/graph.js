import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

let shouldReload = true;
let buttonAdded = false;
let autoReload = true;
let maxAmountNodesAutoReload = 150;

cytoscape.use(dagre);

const workerLayout = {
    name: 'dagre',
    directed: true,
    grid: true,
    fit: true,
    maximal: true,
    rankDir: 'LR',
    rankSep: 300,
    nodeSep: 300
};
const componentLayout = {
    name: 'dagre',
    directed: true,
    grid: true,
    fit: true,
    maximal: true,
    rankDir: 'LR'
};
const workersGraph = createGraph(
    "workerGraph",
    {
        'background-color': '#fff',
        'font-size': '20em',
        'width': 'label',
        'shape': 'rectangle',
        'border-width': '40px',
        'border-color': 'black',
        'content': 'data(name)',
        'background-opacity': '0.85',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'padding': '20em',
    },
    {
        'width': '9px',
        'line-color': 'black',
        'target-arrow-shape': 'triangle',
        'arrow-scale': '5',
        'source-arrow-color': 'black',
        'target-arrow-color': 'black',
        'curve-style': 'bezier'
    }, workerLayout);
const componentsGraph = createGraph(
    "componentGraph",
    {
        'background-color': '#fff',
        'shape': 'roundrectangle',
        'border-width': '1px',
        'border-color': 'black',
        'content': 'data(name)',
        'background-opacity': '0.85',
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'padding': '3px',
        'width': 'label'
    },
    {
        'width': '1px',
        'line-color': 'black',
        'target-arrow-shape': 'triangle',
        'source-arrow-color': 'black',
        'target-arrow-color': 'black',
        'curve-style': 'bezier'
    }, componentLayout);
const selectNodeColor = getComputedStyle(document.body).getPropertyValue('--main-color');
let selectedNode = "";
let automaticallyResetView = true;

function addCheckBox(textEl, input, text){
    const div = document.createElement('label');
    div.classList.add('checkbox_element');
    input.setAttribute("type", "checkbox");
    input.checked = true;
    div.appendChild(input);
    div.appendChild(textEl);
    textEl.innerHTML = text;
    return div;
}

const checkbox = document.getElementById('checkbox');
const automaticResetViewInput = document.createElement("INPUT");
const p = document.createElement("span");
const automaticUpdate = document.createElement("INPUT");
const pAutomaticUpdate = document.createElement("span");
checkbox.appendChild(addCheckBox(p, automaticResetViewInput, "Automatically reset view after adding elements"));
checkbox.appendChild(addCheckBox(pAutomaticUpdate, automaticUpdate, "Automatically update the graph layout"));

//Disables the automatic reset of the view after adding an element to the graph because the user is zooming or panning
function disableAutomaticallyResetView(){
    automaticallyResetView = false;
    automaticResetViewInput.checked = false;
}

//These events check if the user is zooming or panning in the canvas of the graph
workersGraph.on('pinchzoom', (event)=>{
    disableAutomaticallyResetView();
});

workersGraph.on('scrollzoom', (event)=>{
    disableAutomaticallyResetView();
});

workersGraph.on('dragpan', (event)=>{
    disableAutomaticallyResetView();
});

//Event listener on the checkbox to enable or disable the automatic view reset
automaticResetViewInput.addEventListener('input',(event) =>{
    if(automaticResetViewInput.checked){
        automaticallyResetView = true; //No longer want to be zoomed in 
        reloadLayout(workersGraph, workerLayout, true, false);
    }else automaticallyResetView = false; //Zoomed in, do not reset view
});

//Event listener on the checkbox to enable or disable the automatic update of the layout
automaticUpdate.addEventListener('input', (event)=>{
    if(automaticUpdate.checked && workersGraph.nodes().length <= maxAmountNodesAutoReload){
        autoReload = true; //No longer want to manually reload layout
        reloadLayout(workersGraph, workerLayout, true, false);
    }else if(automaticUpdate.checked){
        automaticUpdate.checked = false; //Manually reload layout because there are too many nodes
    }else{
        autoReload = false; //Manually reload layout 
    }
});

function changeCheckbox(){
    automaticResetViewInput.checked = true;
}

//Changes the color of the nodes that where selected to highlight them
function changeColorNodes(graph, target, style, select){
    const nodes = graph.nodes();
    for (let i = 0; i < nodes.length; i++) {
       if(select(nodes[i].data()) == target){
            nodes[i].style(style);
       }
    }
}

//Resets the color back to white to remove the highlight
function resetColor(graph, style){
    const nodes = graph.nodes();
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].style(style);
    }
}

//Invokes the reset procedure for both graphs because the highlight
//is applied to both of them
function resetColorsGraphs(){
    resetColor(componentsGraph, {'background-color': 'white'});
    resetColor(workersGraph, {'background-color': 'white'});
}

//Searches for the correct strategy name in the component graph
function searchStrategy(name){
    const nodes = componentsGraph.nodes();
    for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if(el.data().component === name){
            const selectedComponentStrategy = document.getElementById('selected_component_strategy');
            selectedComponentStrategy.innerHTML = "Strategy selected node: " +el.data().strategy;
        }
    }
}

//Creates a graph for the given name, this name needs to be the same
//as an id in the HTML DOM tree
function createGraph(name, cssNode, cssEdge, layout){
    var cy = cytoscape({
        container: document.querySelector('#'+name),
        layout: layout,
        wheelSensitivity: 0.65,
        style: cytoscape.stylesheet()
            .selector('node')
            .css(cssNode)
            .selector('edge')
            .css(cssEdge),
        elements: {
            nodes: [],
            edges: [],
        },
        autoungrabify: true
    });

    cy.on('tap', function(event){
        const evtTarget = event.target;
        const targetCom = evtTarget.data().component;
      
        if( evtTarget === cy || selectedNode === targetCom){
            //Deselect nodes
            resetColorsGraphs();
            selectedNode = "";
            const selectedComponentStrategy = document.getElementById('selected_component_strategy');
            selectedComponentStrategy.innerHTML = "Select a node to get more information about the strategy";
        } else {
            //Color the nodes in the worker/component graph
            resetColorsGraphs();
            const selectComponent = (el) => el.component;
            changeColorNodes(componentsGraph, targetCom, {'background-color': selectNodeColor}, selectComponent);
            changeColorNodes(workersGraph, targetCom, {'background-color': selectNodeColor}, selectComponent);
            selectedNode = targetCom;
            searchStrategy(targetCom);
        }
      });
    return cy;
}

//Reloads the layout of the given graph when new elements got added to the graph
function reloadLayout(graph, layout, manual, sparseGraph){
    zoom = graph.zoom();
    pan = graph.pan();
    if(autoReload || manual || sparseGraph){ //Reload layout when the autoreload isn't disabled, the user manually wants to reload the layout or it is a sparse graph
        graph.makeLayout(layout).run();
    }
    if(!automaticallyResetView){ //User is zoomed in, do not reset zoom and pan
        graph.zoom(zoom);
        graph.pan(pan);
    }
}

//If the threshold of the maximum amount of nodes is reached, a button needs to be added to manually reload the graphs layout
function addUpdateButton(){
    const checkbox = document.getElementById('checkbox');
    const b = document.createElement('button');
    b.innerHTML = "Manually update layout of the graph"
    b.onclick = (target) => {
        reloadLayout(workersGraph, workerLayout, true, false); //Manually reload layout
    }
    checkbox.appendChild(b);
}

//Check how many nodes are present in a graph. If there are more than the threshold, autoreload of the layout of the graph should be disabled
function checkAmountNodes(nodes){
    if(nodes.length >= maxAmountNodesAutoReload && !buttonAdded){
        autoReload = false;
        automaticUpdate.checked = false;
        addUpdateButton();
        buttonAdded = true;
    }
}

//Adds nodes for the given graph, the componentGroup indicates too which
//component group the workers belong. This is used to highlight the correct
//nodes
function addNodes(graph, nodes, textFormat, componentGroup, checkNodes) {
    for (let idx = 0; idx < nodes.length; idx++) {
        const curNode = nodes[idx];
        const node = { 
            group: "nodes", 
            data: { 
                id: curNode.id,
                name: textFormat(curNode),
                component: componentGroup(curNode),
                createdBy: curNode.created_in,
                strategy: curNode.strategy
            }
        };
        graph.add([node]); 
        checkNodes(graph.nodes());
    }
    shouldReload = true;
}

//Recenters the view of the user in both graphs
function resetView(){
    workersGraph.fit();
    componentsGraph.fit();
}

//Adds edges for the source to the targets into the graph.
function addEdges(graph, source, targets) {
    for (let idx = 0; idx < targets.length; idx++) {
        const target = targets[idx];
        const idEdge = source.concat(target);
        graph.add([{ group: "edges", data: { id: idEdge, source: source, target: target } }]);
    }
    shouldReload = true;
}

//This function get invoked every 2s and checks if new nodes or edges got added to the graph
function checkUpdate(){
    if(shouldReload){
        reloadLayout(workersGraph, workerLayout, false, false);
        reloadLayout(componentsGraph, componentLayout, false, true);
        shouldReload = false;
    }
}

setInterval(checkUpdate, 2000);

export {addNodes, resetView, checkAmountNodes, resetColor, addEdges, changeCheckbox, createGraph, workersGraph, componentsGraph, changeColorNodes}