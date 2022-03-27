let start_time = 0;
let isStarted = false;

function initialize_start_time(start_time_workflow, isStartedWorkflow){
    isStarted = isStartedWorkflow;
    if(isStarted){
        start_time = start_time_workflow;
        update();
    }
}

function updateTime(){
    if(isStarted){
        update();
    }
}

function started(time){
    start_time = time;
    isStarted = true;
}

const oneDayInSec = 86400;

function update(){
    var curSeconds = new Date().getTime() / 1000;
    uptime = (curSeconds - start_time) % oneDayInSec;
    let d = Math.floor((curSeconds - start_time) / oneDayInSec).toString();
    let h = Math.floor(uptime / 3600).toString();
    let m = Math.floor(uptime / 60).toString();
    let s = Math.floor(uptime % 60).toString();
    d = d.padStart(2, '0');
    h = h.padStart(2, '0');
    m = m.padStart(2, '0');
    s = s.padStart(2, '0');
    time = "Uptime workflow: " + d + ":" + h + ":" + m + ":" + s;
    document.getElementById("uptime").innerHTML = time;
}


setInterval(updateTime, 1000);

export{initialize_start_time, started}