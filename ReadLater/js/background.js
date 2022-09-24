//https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
// https://stackoverflow.com/questions/38561136/chrome-extension-to-change-dom-with-a-button-in-extension-popup
//https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript

/* 
sync:

ref.ondata => firebase2local
local.onchanged => NO (cause looping)
event => local2firebase
*/

/* 
db = {
    acticles: [],
    groups: [
        {
            name: 'english',
            urls: ['https://cambridge.com', 'https://doc.com']
        }, {
            name: 'Deep learning',
            urls: ['file:///home/longa/Downloads/Deep%20Learning%20for%20Vision%20Systems-LQN.pdf', 'https://google.com']
        }
    ],
    settings:{
        useFirebase: true,
        loadIcon: true,
        
    }
}
 */

var db = {
    articles: [],
    groups: []
}

var articleSample = {
    icon: "../icon/icon-16.png",
    title: "title",
    host: "host",
    url: "url"
}

const queryTabOptions = {
    activeTab: {
        currentWindow: true,
        active: true
    },
    allTabs: {
        currentWindow: true,
    },
    highlightedTab: {
        highlighted: true,
        currentWindow: true,
    }
}
var useFirebase = true

// not work with mp3
var audioError = new Audio('../error.wav')
var audioSuccess = new Audio('../success.wav')


/* firebase config */
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
var refPath;
var uid;

// Auth
const auth = app.auth();
var provider = new firebase.auth.GoogleAuthProvider()
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('logged in as %c' + user.email, 'color:red', {user});
        uid = user.uid;
        refPath = "read-later-db/" + uid;
        console.log("[auth] refPath=%c"+refPath,'color:#e91e63');
        console.info("init data ....");
        initData();
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

// read data
function initData() {
    if (useFirebase) {
        console.info('use firebase, reading db...')
        const database = firebase.database();

        database.ref(refPath)
            .once('value')
            .then((snapshot) => {
                const val = snapshot.val();
                if (val) {
                    db = val
                    console.log('[init]', db)
                    chrome.browserAction.setBadgeText({
                        text: db?.articles?.length ? '' + db.articles.length : '0'
                    })

                    // if storage.local null then firebase2local
                    chrome.storage.local.getBytesInUse(null, bytes => {
                        if (!bytes) {
                            console.log('[once data] local NULL, firebase2local');
                            firebase2local(db)
                        }
                    });
                } else {
                    console.log("[initData] firebase NULL, set default db");
                    
                    db = {
                        articles: [],
                        groups: []
                    }
                }
                database.ref(refPath)
                    .on('value', (snapshot) => {
                        const val = snapshot.val();
                        if (val) {
                            db = val
                        }
                        // if (db) firebase2local(db)
                    })

                chrome.storage.onChanged.addListener(function (changes) {
                    console.log("[storage change]", changes);
                    chrome.storage.local.get(null, function (data) {
                        if (data) {
                            db = data;
                            local2firebase()
                            chrome.browserAction.setBadgeText({
                                text: db?.articles?.length ? '' + db.articles.length : '0'
                            })
                        }
                    })
                });

            })
            .catch((e) => {
                console.log('Error fetching data', e);
                console.log('fetching from storage.local...');
                chrome.storage.local.get(null, function (data) {
                    if (data) {
                        db = data;
                        console.log("inital database", db);
                    }
                })
            })
            .finally(() => {
                console.log('[set commands]');
                setCommands()
            });

    } else {
        console.info('use chrome.storage, reading db...')

        chrome.storage.local.get(db, function (data) {
            if (data && data.articles) {
                console.log("inital database", data);
                db = data;
            }
            /*
         Command stuffs 
         set in initial setup --> not rewrite database (lost all)
         */

            setCommands()
        })
    }
}


chrome.extension.onMessage.addListener(function (message, messageSender, sendResponse) {
    console.log("[onMessage] Received:", message);
    switch (message.action) {
        case "add-all":
            queryTab(queryTabOptions.allTabs, saveArticles, sendResponse)
            break;
        case "add-current":
            queryTab(queryTabOptions.activeTab, saveArticles, sendResponse)
            break;
        case "add-highlighted":
            queryTab(queryTabOptions.highlightedTab, saveArticles, sendResponse)
            break;
        case "remove":
            let index = parseInt(message.index)
            let deletedItem = db.articles.splice(index, 1)
            chrome.storage.local.set(db, function () {
                console.log("[Storage] removed :" + index, deletedItem[0].title, deletedItem[0]);
                sendResponse({
                    removedItem: deletedItem[0]
                })
            })
            break
        case 'badge-exist':
            setBadge('1')
            return true; // no sync so return.
        case 'save-firebase':
            local2firebase()
            return true;
        case 'export-json':
            save2Json()
            return true;
        case 'save-mhtml':
            saveMHTML()
            return true;

        case 'save-tabs':
            saveTabs()
            return true;
        case 'save-groups':
            saveGroups(message.groups, sendResponse)
            break;
        case 'save-import-data':
            if (useFirebase) {
                local2firebase()
                return true;

            }
            break;

        default:
            break;

    }

    // save to firebase after each action finished
    // local2firebase()
    return true;
});

/* download listener */
// chrome.downloads.onDeterminingFilename.addListener(function (Item, __Suggest) {
//     __Suggest({
//         filename: 'read_later_' + new Date().toDateString().replaceAll(' ', '_') + '.json'
//     });
//     return true;
// });


function setCommands() {
    chrome.commands.onCommand.addListener((command) => {
        if (command == "save-this-tab") {
            queryTab(queryTabOptions.activeTab, saveArticles)

            chrome.browserAction.setIcon({
                path: "../icon/icons8-reading-100-hotkey.png"
            });
            chrome.browserAction.setTitle({
                title: "Added"
            })

            setTimeout(function () {
                chrome.browserAction.setIcon({
                    path: "../icon/icons8-reading-100.png"
                });
                chrome.browserAction.setTitle({
                    title: "Show articles"
                })
            }, 5000)
        }
    })
}

function queryTab(option, callback, sendResponse) {
    chrome.tabs.query(option, function (tabs) {
        console.log('[queryTab] got tabs', tabs);
        if (callback) {
            callback(tabs)
        }

        if (sendResponse) {
            let response = [];
            tabs.forEach(tab => {
                let obj = getArticle(tab, false)
                response.push(obj)
            })
            sendResponse(response)
        }
    });
}

function saveArticles(tabs) {
    // console.log(Array.isArray(db.articles));
    if (tabs.length == 1) {
        let obj = getArticle(tabs[0])
        if (obj && !isUrlExist(obj.url)) {

            db.articles.splice(0, 0, obj) //push to head

            chrome.storage.local.set(db, function () {
                if (chrome.runtime.lastError) {
                    //on false
                    audioError.play()
                } else {
                    audioSuccess.play()
                    console.log("[saveArticles] saved to local", db)
                    // local2firebase()
                }
            });
        }
    }
    if (tabs.length > 1) {
        tabs.forEach(tab => {
            let obj = getArticle(tab)
            if (obj && !isUrlExist(obj.url)) {
                db.articles.splice(0, 0, obj)
            }
        })
        chrome.storage.local.set(db, function () {

            if (chrome.runtime.lastError) {
                //on false
                console.log("[saveArticles] failed to save ", db)
                audioError.play()
            } else {
                audioSuccess.play()
                console.log("[saveArticles] saved to local ", db)
            }
        });
    }
    // set badge
    chrome.browserAction.setBadgeText({
        text: '' + db.articles.length
    })
}

/* 
return {icon, title, url, host}
*/
function getArticle(tab, log = true) {
    if (tab) {
        if (!tab.url ||
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("https://workona.com")
        ) {
            return null;
        }
        let obj = {
            icon: tab.favIconUrl || null,
            title: tab.title || null,
            url: tab.url || null,
            host: new URL(tab.url).origin || null,
        }

        // if (!isKeyExist(db.icons, obj.host)) {
        //     toDataURL(obj.icon, function (dataUrl) {
        //         db.icons[obj.host] = dataUrl

        //         chrome.storage.local.set(db, function () {
        //             console.log("saved new icon", dataUrl)
        //         });
        //     })
        // }

        log && console.log("[getArticle]", obj);
        return obj
    }
    return null;
}

function isUrlExist(url = "") {
    if (db && Array.isArray(db.articles)) {
        let length = db.articles.length
        if (length < 1)
            return false
        for (let i = 0; i < length; i++) {
            if (url == db.articles[i].url) {
                return true;
            }
        }
    }
    return false;
}

function isKeyExist(object, key) {
    let keyArray = Object.keys(object)
    for (let i = 0; i < keyArray.length; i++) {
        if (keyArray[i] == key)
            return true
    }
    return false
}
// base64 icon
function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}



function firebase2local(newDb) {
    console.log("[firebase2local] starting...");

    if (newDb && typeof (newDb) == 'object' && JSON.stringify(newDb) !== '{}')
        // chrome.storage.local.clear(function () {
        //     console.log("[firebase2local] local storage deleted.")
        //     chrome.storage.local.set(newDb,
        //         function () {
        //             console.log("[firebase2local] set local storage success");
        //         }
        //     );
        // })

        // array data so no need to delete local.
        chrome.storage.local.set(newDb,
            function () {
                console.log("[firebase2local] set local storage success");
            }
        );
    else {
        console.log('[firebase2local] invalid database!', newDb);
        db = {
            articles: []
        }
    }
}

function local2firebase() {
    console.log('[local2firebase] starting...');

    // chrome.storage.local.get(null, function (data) {
    //     data && database.ref(refPath).set(data)
    //         .then(() => {
    //             console.log('[local2firebase] Data is saved!', data);
    //         }).catch((e) => {
    //             console.log('[local2firebase] Save failed!', e);
    //         });
    // })

    db && database.ref(refPath).set(db)
        .then(() => {
            console.log('[local2firebase] Data is saved!', db);
        }).catch((e) => {
            console.log('[local2firebase] Save failed!', e);
        });
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

function save2Json() {
    chrome.storage.local.get(null, data => {
        let url = URL.createObjectURL(new Blob([JSON.stringify(data)], {
            type: "text/plain"
        }))

        // chrome.downloads.download({
        //     url
        // })
        const link = document.createElement('a');
        link.href = url
        link.download = 'read_later_'+uid+'_' + new Date().toDateString().replaceAll(' ', '_') + '.json'
        link.click();
    })
}

function saveMHTML() {
    chrome.tabs.query({
        active: true,
        // currentWindow: true
    }, function (tabs) {
        if (!tabs) {
            console.error("[saveMHTML] tabs null")
            return;
        }
        let tab = tabs[0]
        chrome.pageCapture.saveAsMHTML({
            tabId: tab.id
        }, function (res) {
            let oUrl = window.URL.createObjectURL(res)
            const link = document.createElement('a');
            link.href = oUrl
            link.download = tab.title + '.mhtml';
            link.click();
        })
    })
}


function saveTabs() {
    chrome.tabs.query(queryTabOptions.allTabs, function (tabs) {
        let res = tabs.reduce((pre, tab) => {
            pre.push({ 'title': tab.title, 'url': tab.url })
            return pre
        }, [])
        const link = document.createElement('a');
        // link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tabs))
        link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res))
        link.download = tabs[0].title + '.json';
        link.click();

    })
}

function saveGroups(groups, callback) {
    db.groups = groups
    chrome.storage.local.set(db, function () {
        callback({ status: 'success' })
    })
}

