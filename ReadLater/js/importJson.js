document.getElementById('import-btn').onclick = doImport
document.querySelector('pre').focus()

let importData = document.getElementById('import-data')
let useFirebase = true //TODO


window.addEventListener("keydown",
    function (event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    doImport()
                    break;
                default:
                    return;
            }
        }
    }, true
);

function doImport() {
    try {
        let newData = JSON.parse(importData.textContent);
        setDB(newData)

    } catch (error) {
        console.log('err', error)
        showToast('Failed!', 'error')
    }
}


function setDB(newDb) {
    if (newDb && JSON.stringify(newDb) !== '{}')
        chrome.storage.local.clear(function () {
            chrome.storage.local.set(newDb,
                function () {
                    console.log("[setDB] success");
                    if (useFirebase) {
                        chrome.runtime.sendMessage({
                            action: 'save-import-data',
                            payload: newDb
                        })
                    }
                    showToast()
                }
            );
        })

    else {
        console.log('[setDB] empty database!');
        showToast('Failed!', 'error')
    }
}