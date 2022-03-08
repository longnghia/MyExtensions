

const bgList = ["../mylivewallpapers.com-Boba-Tea-Break.mp4", "../mylivewallpapers.com-Butterfly-Anime-Girl.mp4", "../mylivewallpapers.com-Samurai-Girl-Blade-4K.mp4", "../mylivewallpapers.com-Yellow-Space-Suit-Girl.mp4"]

const db2 = {
    omniboxs: [
        {
            src: "paste",
            des: "localhost/paste"
        },
        {
            src: "format",
            des: "localhost/paste"
        },
    ],
    background: ["../mylivewallpapers.com-Boba-Tea-Break.mp4", "../mylivewallpapers.com-Butterfly-Anime-Girl.mp4", "../mylivewallpapers.com-Samurai-Girl-Blade-4K.mp4", "../mylivewallpapers.com-Yellow-Space-Suit-Girl.mp4"]

}

let db = { omniboxs: [], background: [] }
chrome.omnibox.onInputEntered.addListener(function (text) {
    let newURL = "https://google.com"
    getValue().then(data => {
        db = data
        db && db.omniboxs && db.omniboxs.forEach(box => {
            if (box.src == text)
                newURL = box.des;
        })

        chrome.tabs.update({
            url: newURL,
        });
    })
});
// chrome.extension.onMessage.addListener(function (message, messageSender, sendResponse) {
//     if (message.action && message.action == "SAVE_ALL") {
//         console.log('received savehook message, saving to firebase:');
//         database.ref("hook-script").set(message.payload)
//     }
// });

/* fetch videos 
data.txt , ../data.txt => both work!!
*/
fetch("data.txt")
    .then(res => res.text())
    .then(data => {
        let list = data.trim().split('\n')
        console.log("[WG] list: ", list);


        getValue().then(data => {
            db = data
            db.background = list
            chrome.storage.local.set(db, function () {
                console.log("[WG] set bg list successfully!");

            })
        })

    })
    .catch(e => {
        db.background = []
        console.log("error!!!", e)
    }
    )

/* popup */
chrome.browserAction.onClicked.addListener(
    function () {
        // chrome.tabs.create(chrome.extension)
        chrome.runtime.openOptionsPage()
    }
)

function getValue(key = null) {
    return new Promise(function (resolve, reject) {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            return reject(new Error('Storage required'));
        }

        chrome.storage.local.get(key, function (val) {
            if (val) {
                return resolve(val);
            }
            resolve();
        });
    });
};

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
