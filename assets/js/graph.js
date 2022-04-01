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

function changeColorNodes(graph, color, target){
    const nodes = graph.nodes();
    for (let i = 0; i < nodes.length; i++) {
       if(nodes[i].data().component == target){
            nodes[i].style({'background-color': color});
       }
    }
}

function resetColor(graph){
    const nodes = graph.nodes();
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].style({'background-color': 'white'});
    }
}

function resetColorsGraphs(){
    resetColor(componentsGraph);
    resetColor(workersGraph);
}

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
        userZoomingEnabled: false,
        userPanningEnabled: false,
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
            changeColorNodes(componentsGraph, selectNodeColor, targetCom);
            changeColorNodes(workersGraph, selectNodeColor, targetCom);
            selectedNode = targetCom;
        }
      });
    return cy;
}

function addNodes(graph, nodes, textFormat, componentGroup) {
    for (let idx = 0; idx < nodes.length; idx++) {
        const curNode = nodes[idx];

        const node = { 
            group: "nodes", 
            data: { 
                id: curNode.id,
                name: textFormat(curNode),
                component: componentGroup(curNode)
            }
        };
        graph.add([node]); 
    }
    graph.makeLayout(options).run();
    graph.fit(graph.nodes);
}

function addEdges(graph, source, targets) {
    for (let idx = 0; idx < targets.length; idx++) {
        const target = targets[idx];
        const idEdge = source.concat(target);
        graph.add([{ group: "edges", data: { id: idEdge, source: source, target: target } }]);
    }
    graph.makeLayout(options).run();
    graph.fit();
}

export {addNodes, addEdges, createGraph, workersGraph, componentsGraph}