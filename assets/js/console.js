let firstTime = true;

//Adds 1 log message to the console
function addLog(log){
  const div = document.getElementById("console_msg");
  const shouldScroll = div.scrollTop + div.clientHeight === div.scrollHeight;
  addEntry(log);
  updateScroll(div, shouldScroll);
}

//Adds multiple log messages to the console
function addInfo(logs){
    const div = document.getElementById("console_msg");
    const shouldScroll = div.scrollTop + div.clientHeight === div.scrollHeight;
    div.innerHTML = "";
    for (const [key, value] of Object.entries(logs)) {
      addEntry(value);
    }
    updateScroll(div, shouldScroll);
}

//When a new msg is added to the console and the user was scrolled to the bottom
//it needs to scroll down to show the new message
function updateScroll(div, shouldScroll){
  if (firstTime) {
    div.scrollTop = div.scrollHeight;
    firstTime = false;
  } else if (shouldScroll) {
    div.scrollTop = div.scrollHeight;
  }
}

//Adds a console entry into the console, the value is an object with all of the
//information e.g. time, console message, erlang level and name of a worker node
function addEntry(value){
  const div = document.getElementById("console_msg");
  const logEntry = document.createElement('div');
  logEntry.classList.add("log_entry");
  const p = document.createElement('p');
  const p2 = document.createElement('p');
  p.innerHTML ="&#8811 " + timeFormat(value.hour, value.min, value.sec, value.msec) +
    " [" + value.erl_level + "] " + " [" + value.name + "]";
  p2.innerHTML = processeMsgConsole(value.msg);
  logEntry.appendChild(p);
  logEntry.appendChild(p2);
  div.appendChild(logEntry);
}

//Creates the correct time format for the time that is written next to a console message
function timeFormat(hour, minute, sec, msec){
  return hour.toString().padStart(2, '0')+
    ":"+minute.toString().padStart(2, '0')+
    ":"+sec.toString().padStart(2, '0')+
    "."+msec.toString().padStart(3, '0')
}

//The message of a console consists of strings, array of strings and ASCII values. This procedure
//creates from this array a string of the message
function processeMsgConsole(msg){
  curRes = "";
  if (Array.isArray(msg)){
    msg.forEach(el => {
      if(Number.isInteger(el)){
        curRes += String.fromCharCode(el)
      }else if (Array.isArray(el)){
        curRes += processeMsgConsole(el);
      }else{
        curRes += " " + el;
      }
    });
    return curRes;
  }else{
    return msg;
  }
}

export {addInfo, addLog}