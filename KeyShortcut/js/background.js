chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.getBytesInUse(null, bytes => {
        if (!bytes) {
            let db = { collection: ["https://speeding-meadow-414241.postman.co/", "https://example2.com"] }
            chrome.storage.local.set(db, function () {
                console.log("Thank you for install me!")
                console.log("setup inital database...")
            })
        } else {
            console.log("Welcome back!")
        }
    });
})

let audio = new Audio("../beep.wav")

chrome.commands.onCommand.addListener(function (command) {

    /* log tabs */
    if (command == "logTabs") {
        saveTabs();
    } else if (command == "dublicateTab") {
        dublicateTab();
    }
    /* open selected */
    else if (command == "open-in-bg" || command == "open-in-fg") {
        openSelected(command)
    }
    else if (command == "fakeCtrlW") {
        doFakeCtrW()
    }

    else if (command == "dublicateTab") {

    }
})

function openUrl(link, command) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.create({
            url: isURL(link) ? link : 'https://www.google.com/search?q=' + link,
            active: command === 'open-in-bg' ? false : true,
            index: tabs[0].index + 1,
        });
    })

}

function isURL(string) {
    let url;

    try {
        url = new URL(string);
    } catch (e) {
        // console.error(e)
        return false;
    }
    return true
    // return url.protocol === "http:" || url.protocol === "https:";
}

/* tabs */
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

function dublicateTab() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.create({
            active: false,
            openerTabId: tabs[0].id,
            index: tabs[0].index + 1,
            url: tabs[0].url,
        })
    });
}

function save2Json(data) {
    if (data) {
        let url = URL.createObjectURL(new Blob([JSON.stringify(data)], {
            type: "text/plain"
        }))
        const link = document.createElement('a');
        link.href = url
        link.download = 'read_later_' + new Date().toDateString().replaceAll(' ', '_') + '.json'
        link.click();
    }
}

/* Open selected */

function openUrl(link, command) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.create({
            url: isURL(link) ? link : 'https://www.google.com/search?q=' + link,
            active: command === 'open-in-bg' ? false : true,
            index: tabs[0].index + 1,
        });
    })

}

function isURL(string) {
    let url;

    try {
        url = new URL(string);
    } catch (e) {
        // console.error(e)
        return false;
    }
    return true
    // return url.protocol === "http:" || url.protocol === "https:";
}

function openSelected(command) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "open-selected",
            command: command
        }, function (response) {
            response && response.link && openUrl(response.link, command)
        })
    })
}

/* fake ctr w */
function isInCollection(tab) {
    chrome.storage.local.get(null, function (data) {
        if (data.collection) {
            for (let i = 0; i < data.collection.length; i++) {
                let url = data.collection[i];
                if (tab.url.startsWith(url)) {
                    audio.play()
                    console.log("not close postman ok :3");
                    return;
                }
            }
        } else {
            console.log("collection null")
        }
        chrome.tabs.remove(tab.id)
    })
}

function doFakeCtrW() {
    console.log("ctr W!")
    chrome.tabs.query({
        highlighted: true,
        currentWindow: true
    }, function (tabs) {
        for (tab of tabs) {
            isInCollection(tab)
        }
    })
}