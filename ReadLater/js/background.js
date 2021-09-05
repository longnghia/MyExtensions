/* 
remove extension tab: start with: chrome://
bulk delete
shortcut and notification
undo
 */


//https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
// https://stackoverflow.com/questions/38561136/chrome-extension-to-change-dom-with-a-button-in-extension-popup
//https://stackoverflow.com/questions/586182/how-to-insert-an-item-into-an-array-at-a-specific-index-javascript


// function setPopupForChromePage(tab) {
//     if (tab.url.startsWith("chrome://")) {
//         chrome.browserAction.setPopup({
//             popup: "../html/not_this_page.html",
//             tabId: 2
//         })
//     }
// }
// queryTab(current = true, setPopupForChromePage)

var db = {
    articles: []
}
var articleSample = {
    icon: "../icon/icon-16.png",
    title: "title",
    host: "host",
    url: "url"
}

chrome.storage.sync.get(null, function (data) {
    if (data && data.articles) {
        console.log("inital database", data);
        db = data;
    }
})

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
        chrome.storage.sync.set(db, function () {
            console.log("removed :"+index,deletedItem[0].title);
            sendResponse({removed:true})

        })
    }
    return true;
});


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
        if (obj) {

            db.articles.splice(0, 0, obj) //push to head
            chrome.storage.sync.set(db, function () {
                console.log("saved ", db)
            });
        }
    }
    if (tabs.length > 1) {
        tabs.forEach(tab => {
            let obj = getArticle(tab)
            if (obj) {

                db.articles.splice(0, 0, obj)
                chrome.storage.sync.set(db, function () {
                    console.log("saved ", db)
                });
            }
        })
    }
}

function getArticle(tab) {
    if (tab) {
        if (tab.url.startsWith("chrome://")) {
            return null;
        }
        let obj = {
            icon: tab.favIconUrl || null,
            title: tab.title || null,
            url: tab.url || null,
            host: new URL(tab.url).origin || null,
        }
        console.log(obj);
        return obj;
    }
    return null;
}