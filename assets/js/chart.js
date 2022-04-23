import * as c3 from "c3";
import * as d3 from "d3";
import 'c3/c3.min.css'
import * as clusterNodes from "./cluster_nodes.js"

let visible = true;
let cpuUsage = ['Cpu usage'];
let memUsage = ['Memory Usage'];
let xAxis = ['x'];
const cpuChart = createChart("chart_cpu", 'CPU usage (%)', cpuUsage, "%");
const memChart = createChart("chart_mem", 'Memory usage (MB)', memUsage, " MB");

//Creates a chart with the given name, this name needs to be the same as an id in an HML element.
//The text is the text that is written on the Y axis
function createChart(name, text, yAxis, unit){
    let chart = c3.generate({
        bindto: '#' + name,
        size: {
            width: 675,
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
        tooltip: {
            format: {
                value: function (value, ratio, id) {
                    return value + unit;
                }
            }
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

//Adds a single point to the two charts
function addSinglePoint(cpu, mem, time){
    addPointToChart(cpu, cpuUsage);
    addPointToChart(mem, memUsage);
    addTimePoint(time);
    refreshChart(cpuChart, xAxis, cpuUsage);
    refreshChart(memChart, xAxis, memUsage);
}

//Refreshes the chart after adding data to it and only do this if the chart is visible
function refreshChart(chart, xAxis, yAxis){
    if(visible)
        chart.load({
            columns: [
                xAxis,
                yAxis
            ]
        });
}

//Resets the charts so a new data set can be added
function reset(){
    cpuUsage = cpuUsage.slice(0, 1);
    memUsage = memUsage.slice(0, 1);
    xAxis = xAxis.slice(0, 1);
}

//Loads a datat set into the two charts
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
    refreshChart(cpuChart, xAxis, cpuUsage);
    refreshChart(memChart, xAxis, memUsage);
}

//Adds a point to the chart array, but if the array is longer than maximum points
//it needs to remove the second element
function addPointToChart(val, ar){
    removeSecond = (ar) => ar.splice(1,1);
    clusterNodes.addPointToArray(ar, val, removeSecond)
}

//Adds a time point
function addTimePoint(time){
    removeSecond = (ar) => ar.splice(1,1);
    clusterNodes.addPointToArray(xAxis, new Date(time*1000), removeSecond);
}

//Changes if the page is currently visible or not, if it isn't visible the charts
//don't need to be updated or the site will crash.
function changeVisibility(boo){
    visible = boo;
}

export {addSinglePoint, loadDataSet, changeVisibility, reset}