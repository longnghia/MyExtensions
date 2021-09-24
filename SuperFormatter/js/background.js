/* 
async function getCurrentTab() {
    let queryOptions = {
        active: true,
        currentWindow: true
    };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function captureCurrentTab() {

    console.log('request current tab');
    chrome.tabs.query({
        active: true
    }, function (tab) {
        console.log('got current tab');

        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, c=>{
            const e = new window.AudioContext,
            f = e.createMediaStreamSource(c),
            g = e.createGain();
            f.connect(g), g.connect(e.destination)
        });
    });
}

(async function () {

    console.log(new Date().toLocaleTimeString());
    console.log("hi from background!!")


    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {
        console.log(tabs);
    });


    chrome.browserAction.onClicked.addListener(captureCurrentTab);
    // setTimeout(captureCurrentTab,10000)

})(); 

*/

chrome.runtime.onConnect.addListener(function(port){
    console.log("port name: ",port.name);
    port.onMessage.addListener(function(msg){
        console.log(msg.data);
        let data = msg.data
        
    })
})