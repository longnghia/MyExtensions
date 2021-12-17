/* 
remove extension tab: start with: chrome://
bulk delete
shortcut and notification
undo
 */


//https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
// https://stackoverflow.com/questions/38561136/chrome-extension-to-change-dom-with-a-button-in-extension-popup
//https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript


var db = {
    articles: []
}

var articleSample = {
    icon: "../icon/icon-16.png",
    title: "title",
    host: "host",
    url: "url"
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

// Auth
const auth = app.auth();
var provider = new firebase.auth.GoogleAuthProvider()
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('logged in as %c' + user.email, 'color:red', user);
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



// read data
if (useFirebase) {
    console.info('use firebase, reading db...')
    const database = firebase.database();

    database.ref('read-later')
        .once('value')
        .then((snapshot) => {
            const val = snapshot.val();
            if (val) {
                db = val
                console.log('[init]', db)
                chrome.browserAction.setBadgeText({
                    text: db?.articles?.length ? '' + db.articles.length : '0'
                })

                chrome.storage.local.getBytesInUse(null, bytes => {
                    if (!bytes) {
                        console.log('[once data]');
                        syncWithFirebase(db)
                    } else {
                        db = {
                            articles: []
                        }
                    }
                });
            } else {
                db = {
                    articles: []
                }
            }
            database.ref('read-later')
                .on('value', (snapshot) => {
                    const val = snapshot.val();
                    if (val) {
                        db = val
                    }
                    if (db) syncWithFirebase(db)
                })

            chrome.storage.onChanged.addListener(function (changes) {
                console.log("[storage change]", changes);

                chrome.storage.local.get(null, function (data) {
                    if (data) {
                        db = data;
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



chrome.extension.onMessage.addListener(function (message, messageSender, sendResponse) {
    if (message.action == "add-all") {
        queryTab(current = false, saveArticles, sendResponse)
    } else if (message.action == "add-current") {
        queryTab(current = true, saveArticles, sendResponse)
    } else if (message.action == "remove") {
        console.log('received remove message');
        let index = parseInt(message.index)
        // console.log(message.index);
        let deletedItem = db.articles.splice(index, 1)
        chrome.storage.local.set(db, function () {
            console.log("removed :" + index, deletedItem[0].title, deletedItem[0]);
            sendResponse({
                removedItem: deletedItem[0]
            })

        })
    } else if (message.action == 'badge-exist') {
        setBadge('1')
        return true;
    } else if (message.action == 'save-firebase') {
        syncWithStorage()
    } else if (message.action == 'export-json') {
        save2Json()
    } else if (message.action == 'save-mhtml') {
        saveMHTML()
    }
    else if (message.action == 'save-tabs') {
        saveTabs()
    }
    else if (message.action == 'save-groups') {
        saveGroups(message.groups, sendResponse)
    }
    else if (message.action == 'save-import-data') {
        if (useFirebase) {
            syncWithStorage()
        }
    }


    // save to firebase after each action finished
    syncWithStorage()
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
            queryTab(current = true, saveArticles)
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

function queryTab(current = true, callback, sendResponse) {
    let option = current ? {
        currentWindow: true,
        active: true
    } : {
        currentWindow: true,
    }
    chrome.tabs.query(option, function (tabs) {
        console.log('got  tabs', tabs);
        if (callback) {
            callback(tabs)
        }
        if (sendResponse) {
            let response = [];
            if (current)
                response = [getArticle(tabs[0])]
            else {
                tabs.forEach(tab => {
                    let obj = getArticle(tab)
                    response.push(obj)
                })
            }

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
                    console.log("saved ", db)
                    syncWithStorage()
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
            console.log("saved ", db)

            if (chrome.runtime.lastError) {
                //on false
                audioError.play()
            } else {
                audioSuccess.play()
                console.log("saved ", db)
            }
        });
    }
    // set badge
    chrome.browserAction.setBadgeText({
        text: '' + db.articles.length
    })
}

function getArticle(tab) {
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

        console.log(obj);
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



function syncWithFirebase(newDb) {
    if (newDb && typeof (newDb) == 'object' && JSON.stringify(newDb) !== '{}')
        chrome.storage.local.clear(function () {
            chrome.storage.local.set(newDb,
                function () {
                    console.log("[syncWithFirebase] success");
                }
            );
        })
    else {
        console.log('[syncWithFirebase] invalid database!', newDb);
        db = {
            articles: []
        }
    }
}

function syncWithStorage() {
    chrome.storage.local.get(null, function (data) {
        data && database.ref('read-later').set(data)
            .then(() => {
                console.log('[syncWithStorage] Data is saved!', data);
            }).catch((e) => {
                console.log('[syncWithStorage] failed.', e);
            });
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
        link.download = 'read_later_' + new Date().toDateString().replaceAll(' ', '_') + '.json'
        link.click();
    })
}

function saveMHTML() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
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
    chrome.tabs.query({
        currentWindow: true
    }, function (tabs) {
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