import * as c3 from "c3";
import * as d3 from "d3";
import 'c3/c3.min.css'
var cpu_usage = ['Cpu Usage', 0];
var cpu_x = ['x', new Date()];
var max_amount_points = 300;
var chart = c3.generate({
    bindto: '#chart',
    size: {
        width: 1050,
        height: 400
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
            cpu_x,
            cpu_usage,
        ],
    },
    animation: {
        enabled: false
    },
    axis: {
        y: {
            tick: {
                values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                min: 0,
                max: 100
                },
          label:{
              text: 'CPU usage (%)',
              position: 'outer-top'
            }
        },
        x: {
            type: 'timeseries',
            tick: {
                multiline:false,
                format: '%H:%M:%S'
            }
        }  
    }
});

function addPointToChart(val){
    console.log(cpu_usage.length);
    if(cpu_usage.length > max_amount_points){
        cpu_usage.splice(1,1);
        cpu_x.splice(1,1);
    }
    cpu_usage.push(val);
    var now = new Date();
    cpu_x.push(now);
    chart.load({
        columns: [
        cpu_x,
        cpu_usage
        ]
    });
}

export {addPointToChart}