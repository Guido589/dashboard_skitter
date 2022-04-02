import * as c3 from "c3";
import * as d3 from "d3";
import 'c3/c3.min.css'
import * as clusterNodes from "./cluster_nodes.js"

let cpuUsage = ['Cpu usage'];
let memUsage = ['Memory Usage'];
let xAxis = ['x'];
const cpuChart = createChart("chart_cpu", 'CPU usage (%)', cpuUsage);
const memChart = createChart("chart_mem", 'Memory usage (MB)', memUsage);

function createChart(name, text, yAxis){
    let chart = c3.generate({
        bindto: '#' + name,
        size: {
            width: 525,
            height: 250
        },                
        color: {
            pattern: [
                getComputedStyle(document.body).getPropertyValue('--line-chart-color')
            ]
        },
        point: {
            show: false,
        },
        transition: {
            duration: 0
        },
        data: {
            x: 'x',
            xFormat: '%H:%M:%S',
            columns: [
                xAxis,
                yAxis
            ],
        },
        colors: {
            Cpuusage: '#ff0000',
            data2: '#00ff00',
            data3: '#0000ff'
        },
        animation: {
            enabled: false
        },
        axis: {
            y: {
                label:{
                    text: text,
                    position: 'outer-top'
                }
            },
            x: {
                type: 'timeseries',
                tick: {
                    format: '%H:%M:%S'
                }
            }  
        }
    });
    return chart;
}

function addSinglePoint(cpu, mem, time){
    addPointToChart(cpu, cpuUsage);
    addPointToChart(mem, memUsage);
    addTimePoint(time);
    refreshCharts(cpuChart, xAxis, cpuUsage);
    refreshCharts(memChart, xAxis, memUsage);
}

function refreshCharts(chart, xAxis, yAxis){
    chart.load({
        columns: [
            xAxis,
            yAxis
        ]
    });
}

function loadDataSet(points){
    const cpuPoints = points.cpu;
    const memPoints = points.mem;
    const times = points.time;
    for (let i = 0; i < cpuPoints.length; i++) {
        const cpu = cpuPoints[i];
        const mem = memPoints[i];
        const time = times[i];
        addPointToChart(cpu, cpuUsage);
        addPointToChart(mem, memUsage);
        addTimePoint(time);
    }
    refreshCharts(cpuChart, xAxis, cpuUsage);
    refreshCharts(memChart, xAxis, memUsage);
}

function addPointToChart(val, ar){
    removeSecond = (ar) => ar.splice(1,1);
    clusterNodes.addPointToArray(ar, val, removeSecond)
}

function addTimePoint(time){
    clusterNodes.addPointToArray(xAxis, new Date(time*1000), removeSecond);
}

export {addSinglePoint, loadDataSet}