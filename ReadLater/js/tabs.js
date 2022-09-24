/* 
handle shift click:
https://stackoverflow.com/questions/659508/how-can-i-shift-select-multiple-checkboxes-like-gmail
*/


/* 
db = {
    articles: [],
    groups: [
        {
            name: 'english',
            urls: ['https://cambridge.com', 'https://doc.com']
        }, {
            name: 'Deep learning',
            urls: ['file:///home/longa/Downloads/Deep%20Learning%20for%20Vision%20Systems-LQN.pdf', 'https://google.com']
        }
    ]
}
 */

var group = null
var db = {
    articles: [],
    groups: []
};


let allTabsContainer = document.getElementById('all-tabs-container')
let editorContainer = document.getElementById('editor-container')
let editor = document.getElementById('editor')
let preEditor = document.getElementById('pre-editor')
let finalGroups = document.getElementById('final-groups')
let groupName = document.getElementById('group-name')

document.getElementById('save-btn').onclick = saveGroups
document.getElementById('add-btn').onclick = updateFinalGroups
document.getElementById('uncheck-all').onclick = uncheckAll

let beautifyConfig = {
    "indent_size": "4",
    "indent_char": " ",
    "max_preserve_newlines": "5",
    "preserve_newlines": true,
    "keep_array_indentation": true,
    "break_chained_methods": true,
    "indent_scripts": "normal",
    "brace_style": "collapse",
    "space_before_conditional": true,
    "unescape_strings": false,
    "jslint_happy": false,
    "end_with_newline": false,
    "wrap_line_length": "-1",
    "indent_inner_html": false,
    "comma_first": false,
    "e4x": false,
    "indent_empty_lines": false
}
let extId = chrome.runtime.id

chrome.storage.local.get(db, data => {
    db = data;
    console.log('init db:', db);
    init();
})

// show window's tabs && groups editor
function init() {

    chrome.tabs.query({
        // active: true,
        currentWindow: true
    }, function (tabs) {
        console.log(extId);
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i];

            if (tab.url.indexOf(extId) != -1) {
                continue
            }

            let host = new URL(tab.url).origin || ''
            let html =
                // <span>${i}</span>
                `
            <img src="chrome://favicon/size/16@2x/${host}">
            <span>${tab.title}</span>
    `
            let div = document.createElement('div')
            div.className = "tab"
            div.setAttribute('data-url', tab.url)
            div.setAttribute('data-index', i)
            div.onclick = handleDivClicked
            div.innerHTML = html
            allTabsContainer.appendChild(div)
        }

        // set groupname
        groupName.value = `Group ${db.groups.length}`
        groupName.focus()
        groupName.select()
        groupName.onkeyup = function () {
            updateCheckUrl()
        }

        // init editor container
        updateCheckUrl()

        // init  final groups
        finalGroups.textContent = js_beautify(JSON.stringify(db.groups), beautifyConfig)

    })


    /* 
    shortcuts
    ctrl Z: undo
    */
    window.addEventListener("keydown",
        function (event) {
            if (event.ctrlKey) {
                switch (event.key) {
                    case 's':
                        event.preventDefault();
                        saveGroups()
                        break;
                    default:
                        return;
                }
            }
        }, true
    );

}

// handle window'tabs clicked
let lastCheck;
let lastEnd, lastStart, start, end, rangeStart, rangeEnd;

function handleDivClicked(e) {
    // console.log('lastcheck', lastCheck?.getAttribute('data-index'));
    const tabTiles = document.querySelectorAll('div.tab')

    let el = this
    if (!e.shiftKey)
        el.classList.contains('checked') ? el.classList.remove('checked') : el.classList.add('checked')

    if (!lastCheck) {
        lastCheck = el
        updateCheckUrl()

        return
    }

    if (e.shiftKey) {



        start = +lastCheck.getAttribute('data-index')
        end = +el.getAttribute('data-index')
        // console.log('start,end:', start, end);
        if (end > start) {
            isBetween = lastCheck.nextElementSibling?.classList?.contains('checked')
            let offset = isBetween ? 0 : 1
            for (let i = Math.min(start, end) + offset; i <= Math.max(start, end); i++) {
                // if (i != lastCheck)
                tabTiles[i].classList.contains('checked') ? tabTiles[i].classList.remove('checked') : tabTiles[i].classList.add('checked')
            }
        } else {
            // let offset = isBetween ? 0 : 1
            isBetween = lastCheck.previousElementSibling?.classList?.contains('checked')

            let offset = isBetween ? 0 : 1

            for (let i = Math.min(start, end); i <= Math.max(start, end) - offset; i++) {
                // if (i != lastCheck)
                tabTiles[i].classList.contains('checked') ? tabTiles[i].classList.remove('checked') : tabTiles[i].classList.add('checked')
            }
        }


    }

    lastCheck = this

    updateCheckUrl()

}

// update editor
function updateCheckUrl() {
    editor.innerHTML = ''
    let checkedTabs = document.querySelectorAll('div.checked')

    group = {
        name: groupName.value,
        urls: []
    }

    for (let i = 0; i < checkedTabs.length; i++) {
        let tab = checkedTabs[i]
        let tabUrl = tab.getAttribute('data-url')
        group.urls.push(tabUrl)
    }

    preEditor.textContent = js_beautify(JSON.stringify(group), beautifyConfig)
    editor.appendChild(preEditor)
    // updateFinalGroups()
}

function updateFinalGroups() {
    try {

        let tempGroups = [...db.groups]
        group = JSON.parse(preEditor.textContent)
        // tempGroups.push(group)
        tempGroups.splice(0, 0, group) //push to head

        finalGroups.textContent = js_beautify(JSON.stringify(tempGroups), beautifyConfig)
    } catch (e) {
        console.error(e)
        showToast('FAIL!!! '+e, 'error', false)

    }
}


function saveGroups(e) {


    try {
        db.groups = finalGroups.textContent ? JSON.parse(finalGroups.textContent) : []
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
    } catch (e) {
        console.error(e)

        showToast('FAIL!!', 'error', false)
    }

}

function uncheckAll() {
    let tiles = document.querySelectorAll('div.checked')
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.remove('checked')
    }
    // updateFinalGroups()

}

function showToast(msg = 'Success!!', icon = 'success', toast = true) {
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
        title: msg
    })
}

