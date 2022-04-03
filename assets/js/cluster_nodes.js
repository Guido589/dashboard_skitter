import * as chart from "./chart.js"

let cluster_nodes = [];
let max_amount_points = 300;
let selectedNode = "Root";
const gigInBytes = 1073741824;

function initializeClusterNodes(li){
    for (let i = 0; i < li.length; i++) {
        const el = li[i];
        const metrics  = el.metrics[1].concat(el.metrics[0].reverse());
        const detailedMem = el.detailed_mem;
        const cpu_val = [];
        const mem_val = [];
        const time = [];
        metrics.forEach(element => {
            cpu_val.push(element.cpu);
        });
        metrics.forEach(element => {
            mem_val.push(element.mem);
        });
        metrics.forEach(element => {
            time.push(element.time);
        });
        cluster_nodes.push({
            name: el.name,
            cpu: cpu_val,
            mem: mem_val,
            detailedMem: detailedMem,
            time: time
        })

        if(el.name === selectedNode){
            chart.loadDataSet(cluster_nodes[i]);
        }
    }
}

function createDetailedEntry(key, value, classStr){
    const k = document.createElement('p');
    const v = document.createElement('p');
    k.innerHTML = key;
    v.innerHTML = value;
    v.classList.add(classStr)
    document.getElementById("detailed_overview").appendChild(k);
    document.getElementById("detailed_overview").appendChild(v);
}

function addDetailedOverview(name, memVal, detailedMem){
    for (let i = 0; i < cluster_nodes.length; i++) {
        const el = cluster_nodes[i];
        if(el.name === name){
            el.detailedMem = detailedMem;
        }
    }

    if(selectedNode === name){
        document.getElementById("detailed_overview").innerHTML = "";
        document.getElementById("node_selected_title").innerHTML = "Selected node: "+ name;
        createDetailedEntry("Total memory usage ", memVal + " MB", "total_mem")
        for (const [key, value] of Object.entries(detailedMem)) {
            createDetailedEntry(key, value + " MB", "detailed_value")
          }
    }
}

function addPointToArray(ar, val, removeFunc){
    if(ar.length > max_amount_points){
        removeFunc(ar);
    }
    ar.push(val);
}

function addMetricToNode(cpu, mem, time, name){
    for (let i = 0; i < cluster_nodes.length; i++) {
        const el = cluster_nodes[i];
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

function showStats(cpu, mem, name){
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

export {initializeClusterNodes, cluster_nodes, addMetricToNode, addPointToArray, showStats, addDetailedOverview}