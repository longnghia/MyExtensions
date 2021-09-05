document.getElementById("add-current").onclick = addCurrent
document.getElementById("add-all").onclick = addAll
document.getElementById("bulk-delete").onclick = showCheckBox
document.getElementById("btnDelete").onclick = bulkDelete


let countArt = document.getElementById("count-art")
let ul = document.querySelector("ol");
let isPopup = true;
changeBrowserActionIcon()
var db = null;
updateContent();



chrome.storage.onChanged.addListener(function (changes) {
    console.log("db changed", changes)
    // let count = changes.articles.newValue.length;
    // countArt.innerText = count + (count > 1 ? " article" : " articles")
    updateContent()

});

function updateContent() {

    chrome.storage.sync.get(null, function (data) {
        if (data && data.articles) {
            ul.innerHTML = "" //reset
            console.log("update content get data,", data);
            let count = data.articles.length
            countArt.innerText = count + (count > 1 ? " article" : " articles")
            db = data;
            if (db && db.articles) {
                for (let i = 0; i < count; i++) {
                    let li = createListItem(db.articles[i], i);
                    ul.appendChild(li)
                }
            }
            let anchors = document.getElementsByClassName("glyphicon glyphicon-remove");
            console.log("list:", anchors.length);
            for (let i = 0; i < anchors.length; i++) {
                let anchor = anchors[i];
                anchor.onclick = function (event) {
                    event.preventDefault()
                    event.stopPropagation()
                    remove(i);
                }
            }

        }
    })

}

function createListItem({
    icon,
    title,
    url,
    host
}, index) {
    let li = document.createElement("li");
    li.className = "list-art";
    if (!icon) {
        icon = "../icon/icons8-broken-robot-50.png"
    }
    let html = `
    <div>
    <div>
        <input type="checkbox" name="check-delete" class="checkbox-delete not-show" data-index=${index}>
    <div>
    <div>
        <a class="art-link" href=${url} target="_blank">
            <img src="${icon}">
            <div class="art-info">
                <div class="art-title">${title}</div>
                <div class="art-host">${host}</div>
            </div>
            <div class="art-action">
            <i class="glyphicon glyphicon-thumbs-up" data-index=${index}></i>
            <i class="glyphicon glyphicon-remove" data-index=${index}></i>
        </div>
    
        </a>
    </div>

    </div>
    `
    li.innerHTML = html;
    return li;
}

function remove(index) {
    // e.preventDefault()
    // console.log(e.target);
    // let index = e.target.getAttribute("data-index")
    console.log("remove:" + index);
    chrome.runtime.sendMessage({
        "action": "remove",
        "index": index
    }, function (response) {
        if (response.removed)
            console.log("background removed ", index)

    })

    removeListItem(index)
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
    let countDelete=0;
    Array.from(checkboxDelete).forEach(function (checkbox) {
        if (checkbox.checked) {
            // console.log(checkbox.getAttribute("data-index"));
            remove(checkbox.getAttribute("data-index")-countDelete)
            countDelete++
        }
    })
}


function addToList(tabs = []) {
    console.log("receieve:", tabs)
    let i = 0;
    tabs.forEach(tab => {
        let li = createListItem(tab, i);
        ul.insertBefore(li, ul.childNodes[0])
        i++;
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
            path: "../icon/icons8-reading-19.png"
        });
        chrome.browserAction.setTitle({
            title: "Show articles"
        })

    }
    isPopup = false;
}