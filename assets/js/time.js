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

function started(){
    isStarted = true;
}

function update(){
    var curSeconds = new Date().getTime() / 1000;
    uptime = curSeconds - start_time;
    time = new Date(uptime * 1000).toISOString().substr(11, 8)
    time = "Uptime workflow: " + time;
    document.getElementById("uptime").innerHTML = time;
}


setInterval(updateTime, 1000);

export{initialize_start_time, started}