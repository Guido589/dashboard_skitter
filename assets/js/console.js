let firstTime = true;

function updateInfo(log){
  const div = document.getElementById("console_msg");
  const shouldScroll = div.scrollTop + div.clientHeight === div.scrollHeight;
  addEntry(log, div);
  updateScroll(div, shouldScroll);
}

function addInfo(logs){
    const div = document.getElementById("console_msg");
    const shouldScroll = div.scrollTop + div.clientHeight === div.scrollHeight;
    div.innerHTML = "";
    for (const [key, value] of Object.entries(logs)) {
      addEntry(value, div);
    }
    updateScroll(div, shouldScroll);
}

function updateScroll(div, shouldScroll){
  if (firstTime) {
    div.scrollTop = div.scrollHeight;
    firstTime = false;
  } else if (shouldScroll) {
    div.scrollTop = div.scrollHeight;
  }
}

function addEntry(value, div){
  const logEntry = document.createElement('div');
  logEntry.classList.add("log_entry");
  const p = document.createElement('p');
  const p2 = document.createElement('p');
  p.innerHTML = value.hour+":"+value.min+":"+value.sec+
    "."+value.msec+" [" + value.erl_level + "] ";
  p2.innerHTML = processValueMsg(value.msg);
  logEntry.appendChild(p);
  logEntry.appendChild(p2);
  div.appendChild(logEntry);
}

function processValueMsg(msg){
  cur_res = "";
  if (Array.isArray(msg)){
    msg.forEach(el => {
      if(Number.isInteger(el)){
        cur_res += String.fromCharCode(el)
      }else if (Array.isArray(el)){
        cur_res += processValueMsg(el);
      }else{
        cur_res += " " + el;
      }
    });
    return cur_res;
  }else{
    return msg;
  }
  }

export {addInfo, updateInfo}