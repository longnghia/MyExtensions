/* 
https://stackoverflow.com/questions/11000826/ctrls-preventdefault-in-chrome
https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write
*/
let searchTerm = null
let countArt = document.getElementById("count-art")
let containerArt = document.getElementById("container-art")
let containerGroup = document.getElementById("container-group")
let ul = document.querySelector("ol");
let isPopup = true;
var db = null;
let toast = document.getElementById("toast")
let newValue, oldValue
let toolbar = document.getElementById("toolbar")

document.getElementById("add-current").onclick = addCurrent
document.getElementById("add-all").onclick = addAll
document.getElementById("bulk-delete").onclick = showCheckBox
document.getElementById("btnDelete").onclick = bulkDelete
document.getElementById("save-all").onclick = saveAll
document.getElementById("export-json").onclick = saveJSON
document.getElementById("import-json").onclick = importJSON
document.getElementById("save-tabs").onclick = saveTabs
document.getElementById("save-mhtml").onclick = saveMHTML
document.getElementById("search").onkeyup = doSearch
document.getElementById("toolbar-toggle").onclick = toggleToolbar
document.getElementById("group-toggle").onclick = toggleGroup
document.getElementById("group-editor").onclick = openGroupEditor
document.getElementById("copy-highlighted").onclick = copyHighlighted
/* 
db = {
    acticles: [],
    groups: [
        {
            name: 'english',
            urls: ['https://cambridge.com', 'https://doc.com']
        }, {
            name: 'Deep learning',
            urls: ['file:///home/longa/Downloads/Deep%20Learning%20for%20Vision%20Systems-LQN.pdf', 'https://google.com']
        }
    ],
    settings:{
        useFirebase: true
    }
}
 */

// changeBrowserActionIcon()

document.getElementById("search").focus()
updateContent();

chrome.storage.onChanged.addListener(function (changes) {
    console.log("db changed", changes)
    if (changes && changes.articles) {
        newValue = (changes.articles.newValue)
        oldValue = (changes.articles.oldValue)
    }
    updateContent()
});
// if (window.location.hash=='#groups'){
//     toggleGroup()
// }

function updateContent() {

    chrome.storage.local.get(null, function (data) {
        if (data && data.articles) {
            ul.innerHTML = "" //reset
            console.log("[update content] data=", data);
            db = data;
            let indexAfterFilter = []
            chrome.browserAction.setBadgeText({
                text: '' + db.articles.length
            })
            if (searchTerm) {
                db.articles = db.articles.filter(function (tab, index) {
                    if (tab.title.match(searchTerm) || tab.url.match(searchTerm)) {
                        indexAfterFilter.push(index)
                        return true
                    }
                })
                let count = db.articles.length
                countArt.innerText = count + (count > 1 ? " article" : " articles")
                if (db && db.articles) {
                    for (let i = 0; i < count; i++) {
                        let li = createListItem(db.articles[i], indexAfterFilter[i]);
                        ul.appendChild(li)
                    }
                }
                let anchors = document.getElementsByClassName("glyphicon glyphicon-remove");
                for (let i = 0; i < anchors.length; i++) {
                    let anchor = anchors[i];
                    anchor.onclick = function (event) {
                        event.preventDefault()
                        event.stopPropagation()
                        remove(indexAfterFilter[i], i);
                    }
                }
            } else {
                let count = db.articles.length
                countArt.innerText = count + (count > 1 ? " article" : " articles")
                if (db && db.articles) {
                    for (let i = 0; i < count; i++) {
                        let li = createListItem(db.articles[i], i);
                        ul.appendChild(li)
                    }
                }
                let anchors = document.getElementsByClassName("glyphicon glyphicon-remove");
                for (let i = 0; i < anchors.length; i++) {
                    let anchor = anchors[i];
                    anchor.onclick = function (event) {
                        event.preventDefault()
                        event.stopPropagation()
                        remove(i);
                    }
                }
            }
            //open link and remove
            let li = document.getElementsByClassName("art-link");
            for (let i = 0; i < li.length; i++) {
                let anchor = li[i];
                anchor.onclick = function (event) {
                    event.preventDefault()
                    event.stopPropagation()
                    let link = this.href
                    this.querySelector(".glyphicon.glyphicon-remove").click()
                    chrome.tabs.create({
                        url: link,
                        active: false
                    })
                }
            }

            // lazy load------------------
            // --> dramatically improve loading speed!!
            var lazyloadImages = document.querySelectorAll("img.lazy");
            var lazyloadThrottleTimeout;
            const preload = 1.5 // a window and a half
            function lazyload() {
                if (lazyloadThrottleTimeout) {
                    clearTimeout(lazyloadThrottleTimeout);
                }

                lazyloadThrottleTimeout = setTimeout(function () {
                    var scrollTop = window.pageYOffset; //scrollY
                    lazyloadImages.forEach(function (img) {
                        if (img.offsetTop < (window.innerHeight * preload+ scrollTop)) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                        }
                    });
                    if (lazyloadImages.length == 0) {
                        document.removeEventListener("scroll", lazyload);
                    }
                }, 20);
            }
            lazyload()
            document.addEventListener("scroll", lazyload);
            // -------------
        }

        // groups
        // initGroups();

    })

}

/* 
shortcuts
ctrl Z: undo
*/
window.addEventListener("keydown",
    function (event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 'z':
                    event.preventDefault();
                    if (oldValue) {
                        console.log(oldValue);
                        db.articles = oldValue
                        chrome.storage.local.set(db, function () {
                            if (chrome.runtime.lastError) {
                                console.log("undo failed ", db)

                            } else {
                                console.log("undo successed ", db)
                            }
                        });
                    }
                    break;
                case 's':
                    event.preventDefault();
                    saveAll()
                    break;
                default:
                    return;
            }
        }
    }, true
);

function createListItem({
    icon,
    title,
    url,
    host
}, index) {
    let li = document.createElement("li");
    li.className = "list-art";

    // use base64 data
    // if (db.icons && db.icons[host]) {
    //     icon = db.icons[host]
    // } else {
    //     icon = "../icon/icons8-broken-robot-50.png"
    // }

    /* 
    use chrome://favicon2/ icons
    eg: chrome://favicon2/?size=16&scale_factor=1x&page_url=https%3A%2F%2Fopen.spotify.com
    eg: chrome://favicon2?page_url=https%3A%2F%2Fopen.spotify.com
    => NOT WORK
    use chrome://favicon instead of chrome://favicon2
    chrome://favicon/size/16@2x/https://keep.google.com/u/0/
    */
    icon = "chrome://favicon/size/16@2x/" + host

    let html = `
    <div>
    <div>
        <input type="checkbox" name="check-delete" class="checkbox-delete not-show" data-index=${index}>
    <div>
    <div>
        <a class="art-link" href=${url} target="_blank" title="${title}">
            <!--<img src="${icon}">-->
            <img src="" data-src=${icon} class="lazy">
            <div class="art-info">
                <div class="art-title">${title}</div>
                <div class="art-host">${host}</div>
            </div>
            <div class="art-action">
            <!--<i class="glyphicon glyphicon-thumbs-up" data-index=${index}></i>-->
            <i class="glyphicon glyphicon-remove" data-index=${index}></i>
             </div>
    
        </a>
    </div>

    </div>
    `
    li.innerHTML = html;
    return li;
}

function remove(index, htmlIndex) {
    // e.preventDefault()
    // console.log(e.target);
    // let index = e.target.getAttribute("data-index")
    console.log("remove:" + index);
    chrome.runtime.sendMessage({
        "action": "remove",
        "index": index
    }, function (response) {
        if (response.removedItem) {
            console.log("[response] removed item ", response.removedItem)
            setToast(
                "[Removed] " + response.removedItem.title
            )
        } else {
            Swal.fire(
                'Error',
                response.removedItem.title,
                'error'
            )
        }

    })
    htmlIndex ? removeListItem(htmlIndex) : removeListItem(index)
}

function removeListItem(index) {
    ul.removeChild(ul.childNodes[index]);
}

function addAll() {
    changeBrowserActionIcon()
    chrome.runtime.sendMessage({
        "action": "add-all",
    },
        function (response) {
            addToList(response)
        }
    )
}

function addCurrent() {
    changeBrowserActionIcon()
    chrome.runtime.sendMessage({
        "action": "add-current",
    },
        // addToList(tabs))
        function (response) {
            addToList(response)
        })
}

function showCheckBox() {
    let arrayOfElements = document.getElementsByClassName('not-show');
    let lengthOfArray = arrayOfElements.length;

    for (let i = 0; i < lengthOfArray; i++) {
        arrayOfElements[i].style.display = 'block';
    }
}

function bulkDelete() {
    let checkboxDelete = document.getElementsByClassName("checkbox-delete")
    //let length = checkboxDelete.length
    //document.getElementById("btnDelete").innerText = length>1?`Delete ${length} items`:`Delete ${length} item`
    let countDelete = 0;
    Array.from(checkboxDelete).forEach(function (checkbox) {
        if (checkbox.checked) {
            // console.log(checkbox.getAttribute("data-index"));
            remove(checkbox.getAttribute("data-index") - countDelete)
            countDelete++
        }
    })
}


function addToList(tabs = []) {
    console.log("receive:", tabs)
    let i = 0;
    tabs.forEach(tab => {
        if (tab) {

            let li = createListItem(tab, i);
            ul.insertBefore(li, ul.childNodes[0])
            i++;
        }
    })
}

function changeBrowserActionIcon() {
    if (isPopup) {
        chrome.browserAction.setIcon({
            path: "../icon/icons8-reading-color.png"
        });
        chrome.browserAction.setTitle({
            title: "I will read it later!"
        })
    } else {

        chrome.browserAction.setIcon({
            path: "../icon/icons8-reading100.png"
        });
        chrome.browserAction.setTitle({
            title: "Show articles"
        })

    }
    isPopup = false;
}

function saveAll() {
    chrome.storage.local.get(null, function (data) {
        if (data && data.articles) {
            let length = data.articles.length
            let arrUrls = ""
            fetch(chrome.extension.getURL("../css/popup.css")).then(data => data.text()).then(text => {
                arrUrls += `<style>${text}</style><ul>`
                for (let i = 0; i < length; i++) {
                    let url = data.articles[i]

                    if (url) {
                        let li = createListItem(url)
                        arrUrls += li.outerHTML
                    }
                }
                arrUrls += '</ul>'
                let name = "ReadLater_" + new Date().toDateString().replaceAll(' ', '_') + ".html"
                download(arrUrls, name, "text/html");
            })

        }
    })
}

function download(data, filename, type) {
    var file = new Blob([data], {
        type: type
    });
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function doSearch(event) {
    searchTerm = event.target.value ? RegExp(event.target.value, 'i') : null
    updateContent()
    // if (!ul.style.display == 'none') {
    //     // main section
    // } else {
    //     // group section

    // }
}

function setToast(text, timeout = 2500) {
    toast.textContent = text;
    setTimeout(function () {
        toast.textContent = ""
    }, timeout)
}

function saveJSON() {
    chrome.runtime.sendMessage({
        action: 'export-json'
    })
}

function importJSON() {
    chrome.tabs.create({
        url: chrome.extension.getURL('../html/importJson.html')
    })
}
function saveMHTML() {
    chrome.runtime.sendMessage({
        action: 'save-mhtml'
    })
}

function saveTabs() {
    console.log('saving tabs...');

    chrome.runtime.sendMessage({
        action: 'save-tabs'
    })
}

function toggleToolbar() {
    toolbar.style.display == 'block' ? toolbar.style.display = 'none' : toolbar.style.display = 'block'
}

function toggleGroup() {
    console.log('toggleGroup');
    ul.style.display = 'none';
    initGroups()
}

function initGroups() {
    containerGroup.innerHTML = ''

    if (db && db.groups) {
        console.log('initing group...');

        for (let i = 0; i < db.groups.length; i++) {
            let div = document.createElement('div');
            div.className = "group-item";
            let group = db.groups[i]
            let html = `${group.name}`;
            group.urls.forEach(url => {
                let host = new URL(url).origin || '';
                html += `
                <img src="chrome://favicon/size/16@2x/${host}" width="15">
                    `
            })
            div.innerHTML = html;
            div.onclick = function (e) {
                group.urls.forEach(url => {
                    chrome.tabs.create({
                        url: url,
                        active: false
                    })
                })
            }
            containerGroup.appendChild(div)
        }
    }
}

function openGroupEditor() {
    chrome.tabs.create({
        url: chrome.extension.getURL('../html/tabs.html')
    })
}

function copyHighlighted() {
    chrome.tabs.query({
        highlighted: true,
        currentWindow: true
    }, function (tabs) {
        let list = tabs.reduce((list, tab) => { list += tab.url + '\n'; return list }, '')
        console.log('highlighted tabs:', list)
        navigator.clipboard.writeText(list).then(function () {
            showToast(tabs.length + ' tab copied!!')
        }, function () {
            showToast('Failed!!', 'error')
        });
    })
}

function showToast(text = 'success!', icon = 'success') {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: icon,
        title: text
    })
}
