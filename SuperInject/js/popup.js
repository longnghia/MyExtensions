console.log(new Date().toLocaleTimeString());
let ulCdn = document.querySelector("#div-cdn div.list_cdns")
let ulScript = document.querySelector("#div-script div.list_scripts")
let divCdn = document.getElementById("div-cdn")
let divCss = document.getElementById("div-css")
let divScript = document.getElementById("div-script")
let toolbar = document.getElementById("tool-bar")

/* navigate menu */
let listMenu = ["div-cdn", "div-css", "div-script"];
Array.from(toolbar.querySelectorAll(".tool-bar-section")).forEach(section => {
    section.addEventListener("click", function (event) {
        let menu = this.dataset.menu

        console.log(menu + " clicked");

        listMenu.forEach((item, index) => {
            if (item == menu) {
                document.getElementById(item).classList.remove("hidden")
            }
            else {
                document.getElementById(item).classList.add("hidden")
            }
        })
    })
})
toolbar.querySelector(".tool-bar-section").click()


let db2 = {
    dbCSSs: [{
        name: "viblo",
        match: "https://viblo.com",
        css: "h1{font-size: 25px;color: red !important;}"
    }],
    dbCdns: [{
        name: "axios",
        cdns: ["https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"]
    }, {
        name: "jquery",
        cdns: ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"]
    }
    ],
    dbScripts:
        [{
            name: "gpa",
            cdns: ["jquery", "axios"],
            script: "console.log('hi')"
        }]
};

let db = {
    dbScripts: [],
    dbCdns: [],
    dbCSSs: []
}

chrome.storage.local.get(db, function (data) {
    console.log(data);
    db = data;

    let {
        dbScripts,
        dbCdns,
        dbCSSs
    } = db

    if (divCdn) {
        let btnEdit = document.getElementById("btn-edit-cdn")
        btnEdit.addEventListener("click", function (event) {
            event.stopPropagation()
            console.log("edit cdn clicked")
            let url = chrome.extension.getURL("/html/option.html") + '#editcdn'
            // window.open(url)
            chrome.tabs.create({
                url
            });

        })
    }

    dbCdns && dbCdns.forEach((item, index) => {
        let div = document.createElement("div")
        div.className = "cdn_wrapper"
        let cdnUrls = ''
        item.cdns.forEach(url => {
            cdnUrls += `
        <div class="cdn-url">${url}</div>
        `
        })
        let html = `
    <div class="cdn-name">${item.name}</div>
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
                    payload: index
                })
            })
        })
        ulCdn.insertBefore(div, ulCdn.childNodes[0])
    })



    dbScripts && dbScripts.forEach((item, index) => {
        let { name} = item
        let div = document.createElement("div")
        div.className = "script-wrapper"

        let html = `
        ${name}
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
                    payload: index
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
            let url = chrome.extension.getURL("/html/option.html") + `#editscript=${index}`
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
    btnAdd.textContent = "Add"
    btnAdd.addEventListener("click", function (event) {
        event.stopPropagation()
        let url = chrome.extension.getURL("/html/option.html") + `#addscript`
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
            let url = chrome.extension.getURL("/html/option.html") + '#editcss'
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