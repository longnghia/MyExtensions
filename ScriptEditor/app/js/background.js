


chrome.browserAction.onClicked.addListener(
    function(){
        // chrome.tabs.create(chrome.extension)
        chrome.runtime.openOptionsPage()
    }
)