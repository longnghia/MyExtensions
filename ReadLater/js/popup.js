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
let enableDelete = true;
let timeout = null

document.getElementById("add-current").onclick = addCurrent
document.getElementById("add-all").onclick = addAll
document.getElementById("add-highlighted").onclick = addHighlighted
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
document.getElementById("checkbox-enable-delete").onchange = toggleCheckbox
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
            // if (searchTerm) {
            // db.articles = db.articles.filter(function (tab, index) {
            //     if (tab.title.match(searchTerm) || tab.url.match(searchTerm)) {
            //         indexAfterFilter.push(index)
            //         return true
            //     }
            // })
            // let count = db.articles.length
            // countArt.textContent = count + (count > 1 ? " article" : " articles")
            // if (db && db.articles) {
            //     for (let i = 0; i < count; i++) {
            //         let li = createListItem(db.articles[i], indexAfterFilter[i]);
            //         ul.appendChild(li)
            //     }
            // }
            // let anchors = document.getElementsByClassName("glyphicon glyphicon-remove");
            // for (let i = 0; i < anchors.length; i++) {
            //     let anchor = anchors[i];
            //     anchor.onclick = function (event) {
            //         event.preventDefault()
            //         event.stopPropagation()
            //         remove(indexAfterFilter[i], i);
            //     }
            // }
            // } else {

            let count = db.articles.length

            if (db && db.articles) {
                for (let i = 0; i < count; i++) {
                    let li = createListItem(db.articles[i], i);
                    if (searchTerm) {
                        if (!li.textContent.match(searchTerm)) {
                            li.classList.add("hidden")
                        } else {
                            li.classList.remove("hidden")
                        }
                    }
                    ul.appendChild(li)
                }
            }

            /* count art */
            let li = document.getElementsByClassName("list-art hidden");
            count = count - li.length
            countArt.textContent = count + (count > 1 ? " article" : " articles")
            countArt.textContent = count + (count > 1 ? " article" : " articles")

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
                enableDelete && this.querySelector(".glyphicon.glyphicon-remove").click()
                chrome.tabs.create({
                    url: link,
                    active: false
                })
            }
        }


        lazyload()
        document.addEventListener("scroll", lazyload);
        // -------------
        // groups
        // initGroups();

    })

}

// lazy load------------------
// --> dramatically improve loading speed!!
var lazyloadThrottleTimeout;
const preload = 1.5 // a window and a half

function lazyload() {
    var lazyloadImages = document.querySelectorAll("img.lazy");
    if (lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
    }

    lazyloadThrottleTimeout = setTimeout(function () {
        var scrollTop = window.pageYOffset; //scrollY
        lazyloadImages.forEach(function (img) {
            if (img.offsetTop < (window.innerHeight * preload + scrollTop)) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            }
        });
        if (lazyloadImages.length == 0) {
            document.removeEventListener("scroll", lazyload);
        }
    }, 20);
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
                case 'f': // search
                    event.preventDefault();
                    document.getElementById("search").focus()
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
}, index, hidden = false) {
    let li = document.createElement("li");
    li.className = "list-art";
    if (hidden)
        li.classList.add(hidden)
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
            // setToast(
            //     "[Removed] " + response.removedItem.title
            // )
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

function addHighlighted() {
    changeBrowserActionIcon()
    chrome.runtime.sendMessage({
        "action": "add-highlighted",
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

    if (timeout) {
        clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
        // updateContent()
        filterSearch()
    }, 500);
}

function filterSearch() {
    let li = document.getElementsByClassName("list-art");
    let count = li.length
    if (searchTerm) {
        for (let i = 0; i < li.length; i++) {
            if (!li[i].textContent.match(searchTerm)) {
                li[i].classList.add("hidden")
            } else {
                li[i].classList.remove("hidden")
            }
        }
    } else {
        for (let i = 0; i < li.length; i++) {
            li[i].classList.remove("hidden")
        }
    }

    li = document.getElementsByClassName("list-art hidden");
    count = count - li.length
    countArt.textContent = count + (count > 1 ? " article" : " articles")

    lazyload()

}

function setToast(text, timeout = 2500) {
    toast.textContent = text;
    setTimeout(function () {
        toast.textContent = ""
    }, timeout)
}

function saveJSON() {
    try {

        chrome.runtime.sendMessage({
            action: 'export-json'
        })
    } catch (error) {
        console.log(error)
    }
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

        // span 'x' remove group
        let baseSpan = document.createElement('span')
        baseSpan.className = "remove-group"
        baseSpan.textContent = 'x'
        let baseDiv = document.createElement('div');
        baseDiv.className = "group-item";


        for (let i = 0; i < db.groups.length; i++) {
            let divContainer = document.createElement('div');
            let group = db.groups[i]

            let span = baseSpan.cloneNode(true)
            divContainer.appendChild(span)
            span.onclick = function (e) {
                removeGroup(group.name)
            }

            let div = baseDiv.cloneNode(true)
            divContainer.appendChild(div)

            let html = `${group.name}`;
            let spanIcons = ''
            for (let i = 0; i < group.urls.length; i++) {
                if (i < 5) {  //take 5 icons only
                    let url = group.urls[i]
                    let host = new URL(url).origin || '';
                    spanIcons += `
                    <img src="chrome://favicon/size/16@2x/${host}" width="15">
                        `
                }
            }
            html += `<span class='group-icons'>${spanIcons}</span>`
            div.innerHTML = html;
            div.onclick = function (e) {
                group.urls.forEach(url => {
                    chrome.tabs.create({
                        url: url,
                        active: false
                    })
                })
            }
            containerGroup.appendChild(divContainer)
        }
    }
}

function removeGroup(name) {
    let newGroups = db.groups.filter(group => group.name != name)
    db.groups = newGroups
    chrome.runtime.sendMessage({
        "action": "save-groups",
        "groups": db.groups
    }, function (response) {
        if (response.status == 'success') {
            showToast('Saved!!')
        } else {
            showToast('FAIL!!', 'error', false)
            console.log('save false, watch background.js')
        }

    })
    initGroups()
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


function toggleCheckbox() {
    enableDelete = this.checked
}