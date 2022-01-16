/* 
lost eventlistener
https://stackoverflow.com/questions/5113105/manipulating-innerhtml-removes-the-event-handler-of-a-child-element
https://askubuntu.com/questions/811210/how-can-i-make-ls-only-display-files
https://stackoverflow.com/questions/14352290/listing-only-directories-using-ls-in-bash
*/

var port = null;

const PATH_SCRIPTS = '/mnt/01D7FA0FB6446CB0/scripts/MyUserScripts/'
const PATH_EXTENSIONS = '/mnt/01D7FA0FB6446CB0/extensions/'
var getKeys = function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys;
}

var timeout = null;

function appendMessage(text) {
  document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  if (port) {
    document.getElementById('connect-button').style.display = 'none';
    document.getElementById('client').style.display = 'block';
  } else {
    document.getElementById('connect-button').style.display = 'block';
    document.getElementById('client').style.display = 'none';
  }
}

function sendNativeMessage() {
  message = { "text": document.getElementById('input-text').value };
  port.postMessage(message);
  // appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
  console.log(message)

}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  console.log("disconnected")
  console.log(chrome.runtime.lastError.message)
  port = null;
  updateUiState();
}

function connect() {
  var hostName = "com.ln.chrome.script.editor";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  updateUiState();
}

function onLs(message) {
  // console.log(message)
  let ul = document.createElement("ul")
  let liNode = document.createElement('li')
  for (let p of message.split('\n')) {

    let li = liNode.cloneNode(false)
    li.className = "file_name"
    li.addEventListener('click', function () {
      geditScript(p)
    })
    li.textContent = p
    ul.appendChild(li)
  }
  document.body.appendChild(ul)
  port.onMessage.removeListener(onLs);
}
function onLsDir(message) {
  // console.log(message)
  let ul = document.createElement("ul")
  let liNode = document.createElement('li')
  for (let p of message.split('\n')) {

    let li = liNode.cloneNode(false)
    li.className = "file_name"
    li.addEventListener('click', function () {
      geditScript(p, true)
    })
    li.textContent = p
    ul.appendChild(li)
  }
  document.body.appendChild(ul)
  port.onMessage.removeListener(onLsDir);
}

function lsUserScripts() {
  // port.onMessage.removeListener(onNativeMessage);
  document.getElementById('input-text').value = `ls ${PATH_SCRIPTS}`
  port.onMessage.addListener(onLs);
  sendNativeMessage()
}

function geditScript(fileName, isDir = false) {
  if (isDir)
    sendCommand(`code ${PATH_EXTENSIONS}${fileName}`, null)
  else
    sendCommand(`gedit ${PATH_SCRIPTS}${fileName}`, null)
}


function sendCommand(msg, callback) {
  document.getElementById('input-text').value = msg
  port.onMessage.addListener(callback);
  sendNativeMessage()
}

function doSearch(e) {
  let searchPhrase = this.value
  if (timeout)
    clearTimeout(timeout)
  timeout = setTimeout(() => {
    console.log(searchPhrase)

    for (let li of document.querySelectorAll('li.file_name')) {
      if (li.textContent.match(searchPhrase))
        li.classList.remove('hidden')
      else
        li.classList.add('hidden')

    }
  }, 500);
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("search").addEventListener('keyup', doSearch)
  document.getElementById("input-text").addEventListener('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      document.getElementById('send-message-button').click()
      this.blur()
    }
  })
  connect()
  // document.getElementById('connect-button').addEventListener(
  //   'click', connect);
  document.getElementById('send-message-button').addEventListener(
    'click', sendNativeMessage);

  //ls scripts
  document.getElementById('ls').addEventListener(
    'click', function () {
      // sendCommand(`ls -p ${PATH_SCRIPTS} | grep -v /`, onLs)
      sendCommand(`ls ${PATH_SCRIPTS}/`, onLs)
    });

  //ls extensions
  document.getElementById('ls_extensions').addEventListener(
    'click', function () {
      // sendCommand(`ls -d ${PATH_EXTENSIONS}\*/`, onLs)
      sendCommand(`ls  ${PATH_EXTENSIONS}/`, onLsDir)
    });
  updateUiState();

});
