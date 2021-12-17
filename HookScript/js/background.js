/* 
https://www.w3schools.com/howto/howto_css_contenteditable_border.asp
https://stackoverflow.com/questions/3263161/cannot-set-boolean-values-in-localstorage

*/

var useFirebase = true
let db = null


/* 
firebase stuff
*/

const firebaseConfig = {
    apiKey: "AIzaSyBEyfqyxmT4wsd9ccEUmFU6ZjQiG7NruYA",
    authDomain: "fb-extension.firebaseapp.com",
    databaseURL: "https://fb-extension-default-rtdb.firebaseio.com",
    projectId: "fb-extension",
    storageBucket: "fb-extension.appspot.com",
    messagingSenderId: "94024781140",
    appId: "1:94024781140:web:87b20b458c5b79fdbd4cc1",
    measurementId: "G-NFM6C5KQ0K"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// Auth
const auth = app.auth();
var provider = new firebase.auth.GoogleAuthProvider()
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('logged in as %c' + user.email, 'color:red', user);
        console.log('starting...')
        start()
    } else {
        console.log('logged out');
        manualAuthenticate()
    }
})

function manualAuthenticate() {
    chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
        if (token) {
            console.log('Chrome logged in!', token)
            try {
                var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
                firebase.auth().signInWithCredential(credential);
            } catch (error) {
                console.log('try to add user_id to firebase database\'rules', error);
                useFirebase = false;
                chrome.tabs.create({
                    url: chrome.extension.getURL('../html/invali.html')
                })
            }
        } else {
            console.error('Please log in Chrome first!')
        }
    });

}
function authenticate() {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            console.log('success!!!');

            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
            console.log(credential);

            // const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
        }).catch((error) => {

            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            console.log('error!!!', error);

            // The AuthCredential type that was used.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}
function logOut() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log('Signed out!');

    }).catch((error) => {
        // An error happened.
        console.error('Error!!!', err)
    });
}


let enabled = localStorage['enabled'] ? JSON.parse(localStorage['enabled']) : false
chrome.browserAction.setIcon({
    path: enabled ? "../icon/icons8-hook-100-color.png" : "../icon/icons8-hook-100.png"
});

let enabledLog = localStorage['enabledLog'] ? JSON.parse(localStorage['enabledLog']) : false
let logCss = "color: blue"

let db2 = {
    'https://glyph.medium.com/css/e/sr/latin/e/ssr/latin/e/ssb/latin/m2.css': {
        target: 'assets/css/medium.css',
        active: true
    },
    'https://s.gr-assets.com/assets/gr/fonts-e256f84093cc13b27f5b82343398031a.css': 'assets/css/goodreads.css',
    '.+sayHi.js': '',
    'https://91porn.com/videojs/nuevo.min.js': 'https://cdn.jsdelivr.net/gh/LongNghia/Hook-Script-Resources/nuevo.min.js'
}


// chrome.storage.local.get(db, function (data) {
//     if (data) {
//         console.log("inital database", data);
//         db = data;
//         database.ref("hook-script").set(JSON.stringify(db))

//         addBeforeRequestListener()
//     }
// })

function start() {

    if (useFirebase) {

        database.ref('hook-script')
            .once('value')
            .then((snapshot) => {
                const val = snapshot.val();
                // console.log(val);
                db = JSON.parse(val)
                console.log('[init]', db)
                chrome.storage.local.getBytesInUse(null, bytes => {
                    if (!bytes) {
                        syncFirebase(db)
                    }
                });
                addBeforeRequestListener()

                database.ref('hook-script')
                    .on('value', (snapshot) => {
                        db = JSON.parse(snapshot.val())
                        if (db) syncFirebase(db)
                    })

                chrome.storage.onChanged.addListener(function (changes) {
                    console.log("[storage change]", changes);

                    chrome.storage.local.get(null, function (data) {
                        if (data) {
                            db = data;
                            // database.ref("hook-script").set(JSON.stringify(db))

                            removeBeforeRequestListener()
                            addBeforeRequestListener()
                        }
                    })
                });
            })
            .catch((e) => {
                console.log('Error fetching data', e);
                console.log('fetching from storage.local...');
                chrome.storage.local.get(null, function (data) {
                    if (data) {
                        console.log("inital database", data);
                        db = data;
                        addBeforeRequestListener()
                    }
                })
            });



        chrome.extension.onMessage.addListener(function (message, messageSender, sendResponse) {
            if (message.action && message.action == "SAVE_HOOKS") {
                console.log('received savehook message, saving to firebase:');

                database.ref("hook-script").set(JSON.stringify(message.payload))

            }
        });
    }

}

/* 
contextMenus in browser_action
*/


chrome.contextMenus.create({
    title: "Enable Hook-Script",
    type: "checkbox",
    contexts: ["browser_action"],
    onclick: function () {
        toggleEnabled()
    },
    checked: enabled
});

/* 
log
*/
chrome.contextMenus.create({
    title: "Toggle log",
    type: "checkbox",
    contexts: ["browser_action"],
    onclick: function () {
        toggleEnabledLog()
    },
    checked: enabledLog

});
/* 
hard reload
*/
chrome.contextMenus.create({
    title: "Hard reload",
    type: "normal",
    contexts: ["browser_action"],
    onclick: function () {
        location.reload(true);
    },
});


function addBeforeRequestListener() {
    if (!db) {
        console.log("database null!");
        return
    }
    chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestListener, {
        urls: ["<all_urls>"]
    },
        ["blocking"]
    );
}

function removeBeforeRequestListener() {
    console.log("[removeBeforeRequestListener]");
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestListener)
}

function onBeforeRequestListener(info) {
    if (enabledLog) {
        console.log("%c[info.url]", logCss, info.url);
    }
    let availbleKey = hasUrl(info.url)
    if (enabled && availbleKey) {
        console.log("[onBeforeRequest] has url " + info.url);
        if (db[availbleKey] && db[availbleKey]["target"] && db[availbleKey]["active"]) {

            if (db[availbleKey]["target"] == "cancel") { //
                console.log("%c[cancel]", "color: red", +info.url);
                setBadge('X')
                return {
                    cancel: true
                }
            } else {
                let target = db[availbleKey]["target"];
                // if (target.startsWith("js:")) {
                //     console.log("js target!");

                //     let e = target.split("js:")[1].replace('this', info.url);
                //     target = e
                //     console.log("[new target]: ", target)
                // }
                console.log("%c[redirect]", "color: red", "from " + info.url + " to " + target);
                setBadge('~>')
                return {
                    redirectUrl: getChromeUrl(target)
                }
            }
        } else {
            // continue the request
            // console.log("[onBeforeRequestListener] continue " + info.url);
            return {}
        }
    }
}

//browserAction
chrome.browserAction.onClicked.addListener(toggleEnabled);

function hasUrl(url) {
    let keys = Object.keys(db)
    for (let i = 0; i < keys.length; i++) {
        if (url.match(new RegExp(keys[i])) && url != getChromeUrl(db[keys[i]]["target"]))
            return keys[i]
    }
    return ""
}

function getChromeUrl(link) {
    if (link.startsWith("http"))
        return link
    return chrome.extension.getURL(link)
}

function toggleEnabled() {
    enabled = !enabled
    localStorage["enabled"] = enabled
    chrome.browserAction.setIcon({
        path: enabled ? "../icon/icons8-hook-100-color.png" : "../icon/icons8-hook-100.png"
    });
}

function toggleEnabledLog() {
    enabledLog = !enabledLog
    console.log("enabled log: " + enabledLog)
    localStorage["enabledLog"] = enabledLog
    removeBeforeRequestListener()
    addBeforeRequestListener()
}


function syncFirebase(newDb) {
    chrome.storage.local.clear(function () {
        chrome.storage.local.set(newDb,
            function () {
                console.log("[setValue] success");
            }
        );
    })
}

function setBadge(text) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.browserAction.setBadgeText({
            tabId: tabs[0].id,
            text: text
        });
    })
}