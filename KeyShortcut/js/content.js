

/* openselected */
chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message?.action == "open-selected") {
            let link = window.getSelection().toString()
            console.log(link);
            sendResponse({
                link
            })
            return true
        }
    }
);