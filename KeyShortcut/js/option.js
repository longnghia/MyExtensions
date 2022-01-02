let collection = document.getElementById("collection");

function saveCollection() {
    console.log(collection.value);
    let arrayUrls = collection.value.trim().split('\n')
    chrome.storage.local.set({
        collection: arrayUrls
    }, function () {
        let status = document.getElementById("status");
        status.textContent = "Saved";
        setTimeout(function () {
            status.textContent = ''
        }, 750)
    })
}

function restoreCollection() {
    chrome.storage.local.get(null, function (data) {
        console.log(data)
        if (data && data.collection && data.collection.length > 0) {
            let arrayUrls = data.collection;
            let str = "";
            arrayUrls.forEach(url => {
                if (!url == "")
                    str += url + "\n"
            })
            collection.textContent = str
        }
    })
}

document.addEventListener("DOMContentLoaded", restoreCollection);
document.getElementById("save").addEventListener("click", saveCollection)