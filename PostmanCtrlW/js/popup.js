// console.log(new Date().toLocaleTimeString());
// console.log("hello from popup");
// // chrome.extension.getBackgroundPage().console.log("from popup with love")

// function queryCurrentTab(){
//     chrome.tabs.query({
//         currentWindow: true,
//         active: true
//     }, function (tabs) {
//         console.log(tabs);
//     });

// }

// const audioCtx = new window.AudioContext;
// const gain = audioCtx.createGain();

// function captureCurrentTab() {

//     console.log('request current tab');
//     chrome.tabs.query({
//         active: true
//     }, function (tab) {
//         console.log('got current tab');

//         chrome.tabCapture.capture({
//             audio: true,
//             video: false
//         }, c=>{
//             f = audioCtx.createMediaStreamSource(c),
//             f.connect(gain), gain.connect(audioCtx.destination)

//         });
//     });
// }
// checkBox = document.getElementById("check-box")
// slideBar = document.getElementById("slide-bar")
// document.getElementById("slide-bar-value").innerText = (slideBar.value)

// slideBar.addEventListener("mousemove", audioCtx => {
//     document.getElementById("slide-bar-value").innerText = (audioCtx.target.value)
//     g.gain.value = slideBar.value/100;

// })

// function checkBoxClicked(){
//     if (checkBox.checked){
//     console.log("current gain = "+g.gain);

//      captureCurrentTab()
//     }else{
//         // audioCtx.stop(0);
//         console.log("unchecked")
//         audioCtx.close().then(function() { console.log("closed"); });
//     }
// }
// checkBox.onclick= checkBoxClicked
