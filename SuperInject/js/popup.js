console.log(new Date().toLocaleTimeString());
let ulCdn = document.querySelector("#div-cdn div.list_cdns")
let ulScript = document.querySelector("#div-script div.list_scripts")
let divCdn = document.getElementById("div-cdn")
let divCss = document.getElementById("div-css")


/* let db = {
    scripts: {
        "pin_get": {
            name: "pin get",
            cdn: ["bootstrap", "jquery"],
            script: "function a(){console.log('hello from function a')}"
        },
        "portal": {
            name: "portal",
            cdn: [],
            script: ""
        }
    },
    cdns: {
        "bootstrap": [
            "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js"
        ],
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"]
    },
    CSSs: [
        {
            "name": "viblo",
            "match": "https://viblo.com",
            "css": "h1{font-size: 25px;color: red !important;}"
        },
        {
            "name": "englishtips",
            "match": "http://englishtips.org/",
            "css": "h1{font-size: 25px;color: red !important;}"
        }
    ]
}
 */
let db = {
    scripts: {},
    cdns: {}
}

chrome.storage.local.get(db, function (data) {
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
        let div = document.createElement("div")
        div.className = "cdn_wrapper"
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
        div.innerHTML = html;
        div.addEventListener("click", function (event) {
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
        ulCdn.insertBefore(div, ulCdn.childNodes[0])
    })



    Object.keys(db.scripts).forEach(key => {
        let div = document.createElement("div")
        div.className = "script-wrapper"

        let html = `
        ${key}
    `
        div.innerHTML = html;
        div.addEventListener("click", function (event) {
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
        /* 
        editscript
        */
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
        div.appendChild(btnEdit)
        ulScript.insertBefore(div, ulScript.childNodes[0])

    })
    /* 
    addscript
    */
    let btnAdd = document.createElement("BUTTON")
    btnAdd.className = "btn-add-script"
    btnAdd.textContent = "Add script +"
    btnAdd.addEventListener("click", function (event) {
        event.stopPropagation()
        console.log("add clicked")
        let url = chrome.extension.getURL("../html/option.html") + `#addscript`
        // window.open(url)
        chrome.tabs.create({
            url
        });

    })
    ulScript.appendChild(btnAdd)

    /* 
    addcss
    */
    if (divCss) {
        let btnEdit = document.getElementById("btn-edit-css")
        btnEdit.addEventListener("click", function (event) {
            event.stopPropagation()
            console.log("editcss clicked")
            let url = chrome.extension.getURL("../html/option.html") + '#editcss'
            // window.open(url)
            chrome.tabs.create({
                url
            });

        })
    }
})
/*

#editscript=jquery
#editcdn
#addscript
#addcdn
#editcss

*/