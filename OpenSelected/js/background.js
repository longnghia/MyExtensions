chrome.commands.onCommand.addListener(function (command) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            command
        }, function (response) {
            response && response.link && openUrl(response.link, command)
        })
    })
})

function openUrl(link, command) {
    chrome.tabs.create({
        url: isURL(link) ? link : 'https://www.google.com/search?q=' + link,
        active: command === 'open-in-bg' ? false : true
    });
}

function isURL(string) {
    let url;

    try {
        url = new URL(string);
    } catch (e) {
        console.error(e)
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}