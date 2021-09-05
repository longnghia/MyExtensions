/* 
https://developer.chrome.com/docs/extensions/reference/commands/
https://developer.chrome.com/docs/extensions/reference/tabs/#method-remove
https://developer.chrome.com/docs/extensions/mv2/options/


option:
add other page

*/

let collection = {
    collection: []
}

getCollection()

function getCollection() {
    chrome.storage.sync.get(collection, function (data) {
        collection = data;
    })
}

chrome.commands.onCommand.addListener(function (command) {
    getCollection()
    if (command === "fakeCtrlW") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tab) {
            console.log(isInCollection(tab[0].url));
            if (!isInCollection(tab[0].url)) {
                chrome.tabs.remove(tab[0].id)
            } else {
                console.log("not close postman ok :3");
            }
        })
    }
})

function isInCollection(tabUrl) {
    // chrome.storage.sync.get(collection, function (data) {   //not work cause async
    //     collection = data;
    if (collection.collection) {
        console.log(collection.collection);
        for (let i = 0; i < collection.collection.length; i++) {
            let url = collection.collection[i];
            if (tabUrl.startsWith(url)) {
                return true;
            }
        }
    }
    // })
    return false
}