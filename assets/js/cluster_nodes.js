import * as chart from "./chart.js"

let clusterNodes = [];
let maxAmountPoints = 300;
let selectedNode = "";
const gigInBytes = 1073741824;

//Receives all of the workers in a cluster and creates an entry in the clusterNodes
//array for each one. It also selects the selectedNode if it is a master or a local node.
function initializeClusterNodes(obj){
    for (const [name, el] of Object.entries(obj)) {
            const metrics  = el.metrics[1].concat(el.metrics[0].reverse());
            const detailedMem = el.detailed_mem;
            const cpuVal = [];
            const memVal = [];
            const time = [];
            if(el.mode === "master" || el.mode === "local"){
                selectedNode = name;
            }
            createNode(name);
            metrics.forEach(element => {
                cpuVal.push(element.cpu);
            });
            metrics.forEach(element => {
                memVal.push(element.mem);
            });
            metrics.forEach(element => {
                time.push(element.time);
            });

            obj = {
                name: name,
                cpu: cpuVal,
                mem: memVal,
                detailedMem: detailedMem,
                time: time
            }
            clusterNodes.push(obj)
    
            if(name === selectedNode){
                chart.loadDataSet(obj);
        }
    }
}

//Edits the DOM tree to add a rectangle with all of the information for that node
//name, cpu usage and memory usage.
//The ids for the HTML elements are i.e. name + _node so that if we need to update
//the value in the future we can retrieve it with the unique name
function createNode(name){
    const clusterNodesDiv = document.getElementById("cluster_nodes");
    const div = document.createElement('div');
    div.onclick = (target) =>{
        if(name !== selectedNode){
            const checkMark = document.getElementById(selectedNode + "_check_mark");
            const clickedCheckMark = document.getElementById(name + "_check_mark");
            selectedNode = name;
            chart.reset();
            checkMark.style.visibility = "hidden";
            clickedCheckMark.style.visibility = "visible";
            obj = clusterNodes.find(el => el.name === selectedNode);
            changeSelectedNodeInfo(name, obj.mem.slice(-1), obj.detailedMem)
            chart.loadDataSet(obj);
        }
    };
    div.setAttribute('id', name + '_node');
    div.classList.add("nodes");
    const divTitle = document.createElement('div');
    divTitle.classList.add('node_title');
    const h3 = document.createElement('h3');
    const checkMark = document.createElement('p');
    if(name != selectedNode){
        checkMark.style.visibility = "hidden";
    }
    checkMark.setAttribute('id', name + '_check_mark');
    checkMark.classList.add('check_mark');
    h3.innerHTML = name 
    checkMark.innerHTML = '&#9745;';
    divTitle.appendChild(h3);
    divTitle.appendChild(checkMark);
    div.appendChild(divTitle);
    const cpu = document.createElement('p');
    cpu.innerHTML = "CPU usage: 00%"
    cpu.setAttribute('id', name + '_cpu');
    const memory = document.createElement('p');
    memory.innerHTML = "Memory usage: 0 MB"
    memory.setAttribute('id', name + '_memory');
    div.appendChild(cpu);
    div.appendChild(memory);
    clusterNodesDiv.appendChild(div);
}

//Edits the HTML DOM tree to update the selected node detailed overview next
//to the 2 charts.
function createDetailedEntry(key, value, classStr){
    const k = document.createElement('p');
    const v = document.createElement('p');
    k.innerHTML = key;
    v.innerHTML = value;
    v.classList.add(classStr)
    document.getElementById("detailed_overview").appendChild(k);
    document.getElementById("detailed_overview").appendChild(v);
}

//Updates the selected node overview for the given name
function changeSelectedNodeInfo(name, memVal, detailedMem){
    document.getElementById("detailed_overview").innerHTML = "";
    document.getElementById("node_selected_title").innerHTML = "Selected node: "+ name;
    createDetailedEntry("Total memory usage ", memVal + " MB", "total_mem")
    for (const [key, value] of Object.entries(detailedMem)) {
        createDetailedEntry(key, value + " MB", "detailed_value")
      }
}

//Updates the detailed overview for the given name in the clusterNodes array and
//if that node is the selected node, the info next to the chart also needs to be
//updated
function addDetailedOverview(name, memVal, detailedMem){
    for (let i = 0; i < clusterNodes.length; i++) {
        const el = clusterNodes[i];
        if(el.name === name){
            el.detailedMem = detailedMem;
        }
    }

    if(selectedNode === name){
        changeSelectedNodeInfo(name, memVal, detailedMem);
    }
}

//Adds a value to the array but it first checks if it isn't getting longer than
//the maximum length
function addPointToArray(ar, val, removeFunc){
    if(ar.length > maxAmountPoints){
        removeFunc(ar);
    }
    ar.push(val);
}

//Searches for the name in the cluserNodes array and adds to the array the different values,
//if the name is the value that is currently selected it adds the values to the chart
function addMetricToNode(cpu, mem, time, name){
    for (let i = 0; i < clusterNodes.length; i++) {
        const el = clusterNodes[i];
        if(el.name === name){
            removeFirst = (ar) => ar.shift();
            addPointToArray(el.cpu, cpu, removeFirst);
            addPointToArray(el.mem, mem, removeFirst);
            addPointToArray(el.time, time, removeFirst);
        }
    }

    if(selectedNode === name){
        chart.addSinglePoint(cpu, mem, time);
    }
}

//Edits the HTML DOM tree of the node to the new updated values
function showStats(cpu, mem, name){
    if(clusterNodes.some(el =>{if (el.name === name) return true})){
        document.getElementById(name + "_cpu").innerHTML = "CPU usage: " + cpu + "%";
        if(mem < gigInBytes){
          document.getElementById(name + "_memory").innerHTML = "Memory usage: " + mem + " MB";
        }else{
          document.getElementById(name + "_memory").innerHTML = "Memory usage: " + ((mem) / (1024)).toFixed(2) + " GB";
        }
      
        if(cpu >= 75){
          document.getElementById(name + "_node").style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--high-cpu-usage');
        }else if(cpu >= 50){
          document.getElementById(name + "_node").style.backgroundColor =getComputedStyle(document.body).getPropertyValue('--medium-cpu-usage');
        }else{
          document.getElementById(name + "_node").style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--low-cpu-usage');
        }
    }
}

export {initializeClusterNodes, clusterNodes, addMetricToNode, addPointToArray, showStats, addDetailedOverview}