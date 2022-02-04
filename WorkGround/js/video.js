/* 
https://stackoverflow.com/questions/4129102/html5-video-dimensions
*/
var vid = document.getElementById("myVideo");
vid.addEventListener("loadedmetadata", function (e) {
    var width = this.videoWidth,
        height = this.videoHeight;
    document.body.style.background = "none"
    /* size */
    const ratio = innerHeight / innerWidth
    let vidRatio = height/width

    console.log(vidRatio);

    if (vidRatio > ratio) {
        vid.style.width = innerWidth + 'px'
        console.log(1);

    } else {
        vid.style.height = innerHeight + 'px'
        console.log(2);
    }
}, false);

if (localStorage["background"]) {
    let i = localStorage["background"]
    chrome.storage.local.get(null, db => {
        if (db && db.background) {
            vid.src = chrome.extension.getURL(db.background[i])
        }
    })
} else {
    console.log("[WG] src not found");

    vid.src = chrome.extension.getURL("mylivewallpapers.com-Yellow-Space-Suit-Girl.mp4")
}

