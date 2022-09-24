let useFirebase = true;
let appReady = false;

chrome.browserAction.setIcon({
    path: '../icon/icons8-syringe-100-grey.png',
});

let db = {}
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


function start() {

    if (useFirebase) {

        database.ref('super-inject')
            .once('value')
            .then((snapshot) => {

                const val = snapshot.val();
                // console.log(val);
                if (val) {
                    db = val
                }

                chrome.storage.local.getBytesInUse(null, bytes => {
                    if (!bytes) {
                        console.log('[oncevalue] init firebase--> local\n', db)
                        firebase2local(db)
                    } else {
                        "[oncevalue] local not null, no sync."
                    }
                });

                database.ref('super-inject')
                    .on('value', (snapshot) => {
                        console.log('[onvalue]')
                        const val = snapshot.val()
                        if (val)
                            db = val
                        if (db) firebase2local(db)
                    })

                chrome.storage.onChanged.addListener(function (changes) {
                    console.log("[storage change]", changes);
                    // not sync local2firebase cause "chrome.storage.local.clear called"
                    chrome.storage.local.get(null, function (data) {
                        if (data) {
                            db = data;
                        }
                    })
                });
                setAppReady()
            })
            .catch((e) => {
                console.log('Error fetching data', e);
                console.log('fetching from storage.local...');
                chrome.storage.local.get(null, function (data) {
                    if (data) {
                        console.log("inital database", data);
                        db = data;
                    }
                })
            });



        chrome.extension.onMessage.addListener(function (message, messageSender, sendResponse) {
            if (message.action && message.action == "SAVE_DB") {
                console.log('received message, saving to firebase:');
                // database.ref("super-inject").set(message.payload)
                local2firebase()
                    .then(res => sendResponse(res))
                    .catch(res => sendResponse(res))

                return true
            }
        });
    }

}

function firebase2local(newDb) {
    if (newDb) {
        console.log('[firebase2local] clearing local...')
        chrome.storage.local.clear(function () {
            console.log('[firebase2local] setting local...')
            chrome.storage.local.set(newDb,
                function () {
                    console.log("[firebase2local] local successfully set!");
                }
            );
        })
    }
}

function local2firebase() {
    return new Promise((resolve, reject) => {
        // chrome.storage.local.get(null, function (data) {
        db && database.ref('super-inject').set(db)
            .then(() => {
                console.log('[local2firebase] firebase successfully set!');
                resolve("[local2firebase] success!")
            }).catch((e) => {
                console.log('[local2firebase] failed.', e);
                reject("[local2firebase] failed!")
            });
        // })
    })
}

function setAppReady() {
    console.log("app ready!");

    chrome.browserAction.setIcon({
        path: '../icon/icons8-syringe-100.png',
    });
    appReady = true
}