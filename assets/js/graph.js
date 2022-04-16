import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const workersGraph = createGraph("workerGraph");
const componentsGraph = createGraph("componentGraph");
const selectNodeColor = getComputedStyle(document.body).getPropertyValue('--main-color');

let selectedNode = "";

let options = {
    name: 'dagre',
    directed: true,
    grid: true,
    fit: true,
    maximal: true,
    rankDir: 'LR'
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

//Creates a graph for the given name, this name needs to be the same
//as an id in the HTML DOM tree
function createGraph(name){
    var cy = cytoscape({
        container: document.querySelector('#'+name),
        layout: options,
        style: cytoscape.stylesheet()
            .selector('node')
            .css({
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
            })
            .selector('edge')
            .css({
                'width': '1px',
                'line-color': 'black',
                'target-arrow-shape': 'triangle',
                'source-arrow-color': 'black',
                'target-arrow-color': 'black',
                'curve-style': 'bezier'
            }),
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
            resetColorsGraphs();
            selectedNode = "";
        } else {
            resetColorsGraphs();
            const selectComponent = (el) => el.component;
            changeColorNodes(componentsGraph, targetCom, {'background-color': selectNodeColor}, selectComponent);
            changeColorNodes(workersGraph, targetCom, {'background-color': selectNodeColor}, selectComponent);
            selectedNode = targetCom;
        }
      });
    return cy;
}

//Adds nodes for the given graph, the componentGroup indicates too which
//component group the workers belong. This is used to highlight the correct
//nodes
function addNodes(graph, nodes, textFormat, componentGroup) {
    for (let idx = 0; idx < nodes.length; idx++) {
        const curNode = nodes[idx];
        const node = { 
            group: "nodes", 
            data: { 
                id: curNode.id,
                name: textFormat(curNode),
                component: componentGroup(curNode),
                createdBy: curNode.created_in
            }
        };
        graph.add([node]); 
    }
    graph.makeLayout(options).run();
    graph.fit(graph.nodes);
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
    graph.makeLayout(options).run();
    graph.fit();
}

export {addNodes, resetView, resetColor, addEdges, createGraph, workersGraph, componentsGraph, changeColorNodes}