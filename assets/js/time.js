let start_time = 0;
let isStarted = false;
const oneDayInSec = 86400;

//Initializes the start time received from the socket
function initializeStartTime(start_time_workflow, isStartedWorkflow){
    isStarted = isStartedWorkflow;
    if(isStarted){
        start_time = start_time_workflow;
        update();
    }
}

//This function gets invoked every second but it can only update the time if
//the workflow is already started.
function updateTime(){
    if(isStarted){
        update();
    }
}

//Updates the boolean isStarted so the counter can start
function started(time){
    start_time = time;
    isStarted = true;
}

//Updates the timer by substracting the start time with the current time
function update(){
    var curSeconds = new Date().getTime() / 1000;
    totUptime = curSeconds - start_time;
    uptime = totUptime % oneDayInSec;
    let d = Math.floor(totUptime / oneDayInSec).toString();
    let h = Math.floor(uptime / 3600).toString();
    let m = Math.floor((uptime / 60) % 60).toString();
    let s = Math.floor(uptime % 60).toString();
    d = d.padStart(2, '0');
    h = h.padStart(2, '0');
    m = m.padStart(2, '0');
    s = s.padStart(2, '0');
    time = "Uptime workflow: " + d + ":" + h + ":" + m + ":" + s;
    document.getElementById("uptime").innerHTML = time;
}

setInterval(updateTime, 1000);

export{initializeStartTime, started}