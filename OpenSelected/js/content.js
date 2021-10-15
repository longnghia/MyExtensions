chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        let link = window.getSelection().toString()
        console.log(link);

        sendResponse({
            link
        })
        return true
    }
);