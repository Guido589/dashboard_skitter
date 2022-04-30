import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

let shouldReload = true;
let buttonAdded = false;
let autoReload = true;
let maxAmountNodesAutoReload = 175;

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
const input = document.createElement("INPUT");
const p = document.createElement("span");
const automaticUpdate = document.createElement("INPUT");
const pAutomaticUpdate = document.createElement("span");
checkbox.appendChild(addCheckBox(p, input, "Automatically reset view after adding elements"));
checkbox.appendChild(addCheckBox(pAutomaticUpdate, automaticUpdate, "Automatically update the layout of the graph"));

function disableAutomaticallyResetView(){
    automaticallyResetView = false;
    input.checked = false;
}

workersGraph.on('pinchzoom', (event)=>{
    disableAutomaticallyResetView();
});

workersGraph.on('scrollzoom', (event)=>{
    disableAutomaticallyResetView();
});

workersGraph.on('dragpan', (event)=>{
    disableAutomaticallyResetView();
});

input.addEventListener('input',(event) =>{
    if(input.checked){
        automaticallyResetView = true;
        reloadLayout(workersGraph, workerLayout, true, false);
    }else automaticallyResetView = false;
});

automaticUpdate.addEventListener('input', (event)=>{
    if(automaticUpdate.checked && workersGraph.nodes().length < maxAmountNodesAutoReload){
        autoReload = true;
        reloadLayout(workersGraph, workerLayout, true, false);
    }else if(automaticUpdate.checked){
        automaticUpdate.checked = false;
    }else{
        autoReload = false;
    }
});

function changeCheckbox(){
    input.checked = true;
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

function reloadLayout(graph, layout, manual, sparseGraph){
    zoom = graph.zoom();
    pan = graph.pan();
    if(autoReload || manual || sparseGraph){
        graph.makeLayout(layout).run();
    }
    if(!automaticallyResetView){
        graph.zoom(zoom);
        graph.pan(pan);
    }
}

function addUpdateButton(){
    const checkbox = document.getElementById('checkbox');
    const b = document.createElement('button');
    b.innerHTML = "Manually update layout of the graph"
    b.onclick = (target) => {
        reloadLayout(workersGraph, workerLayout, true, false);
    }
    checkbox.appendChild(b);
}

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

function checkUpdate(){
    if(shouldReload){
        reloadLayout(workersGraph, workerLayout, false, false);
        reloadLayout(componentsGraph, componentLayout, false, true);
        shouldReload = false;
    }
}

setInterval(checkUpdate, 2000);

export {addNodes, resetView, checkAmountNodes, resetColor, addEdges, changeCheckbox, createGraph, workersGraph, componentsGraph, changeColorNodes}