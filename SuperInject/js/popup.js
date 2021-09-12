console.log(new Date().toLocaleTimeString());
let ulCdn = document.querySelector("#div-cdn ul")
let ulScript = document.querySelector("#div-script ul")
let divCdn = document.getElementById("div-cdn")


// let db = {
//     scripts: {
//         "pin_get": {
//             name: "pin get",
//             cdn: ["bootstrap", "jquery"],
//             script: "function a(){console.log('hello from function a')}"
//         },
//         "portal": {
//             name: "portal",
//             cdn: [],
//             script: ""
//         }
//     },
//     cdns: {
//         "bootstrap": [
//             "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css",
//             "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js"
//         ],
//         "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"]
//     }
// }

let db = {
    scripts: {},
    cdns: {}
}

chrome.storage.sync.get(db, function (data) {
    console.log(data);
    db = data;

    let {
        scripts,
        cdns
    } = db

    if (divCdn) {
        let btnEdit = document.getElementById("btn-edit-cdn")
        btnEdit.addEventListener("click", function (event) {
            event.stopPropagation()
            console.log("edit clicked")
            let url = chrome.extension.getURL("../html/option.html") + '#editcdn'
            // window.open(url)
            chrome.tabs.create({
                url
            });

        })
    }
    Object.keys(cdns).forEach(key => {
        let li = document.createElement("LI")
        let cdnUrls = ''
        cdns[key].forEach(url => {
            cdnUrls += `
        <div class="cdn-url">${url}</div>
        `
        })
        let html = `
    <div class="cdn-name">${key}</div>
    ${cdnUrls}
    `
        li.innerHTML = html;
        li.addEventListener("click", function (event) {
            // chrome.runtime.sendMessage({action:'inject-cdn',payload:key})//not work
            chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, tabs => {
                tabs[0] && chrome.tabs.sendMessage(tabs[0].id, {
                    action: "inject-cdn",
                    payload: key
                })
            })
        })
        ulCdn.insertBefore(li, ulCdn.childNodes[0])
    })



    Object.keys(db.scripts).forEach(key => {
        let li = document.createElement("LI")

        let html = `
        ${key}
    `
        li.innerHTML = html;
        li.addEventListener("click", function (event) {
            // chrome.runtime.sendMessage({action:'inject-cdn',payload:key})//not work
            chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, tabs => {
                tabs[0] && chrome.tabs.sendMessage(tabs[0].id, {
                    action: "inject-script",
                    payload: key
                })
            })
        })

        let btnEdit = document.createElement("BUTTON")
        btnEdit.className = "btn-edit-script"
        btnEdit.textContent = "Edit"
        btnEdit.addEventListener("click", function (event) {
            event.stopPropagation()
            console.log("edit clicked")
            let url = chrome.extension.getURL("../html/option.html") + `#editscript=${key}`
            // window.open(url)
            chrome.tabs.create({
                url
            });

        })
        li.appendChild(btnEdit)
        ulScript.insertBefore(li, ulScript.childNodes[0])
    })
})
/* 

#editscript=jquery
#editcdn
#addscript
#addcdn 

*/