/*
 let db = {
    scripts: {
        "pin_get": {
            name: "pin get",
            cdn: ["bootstrap", "jquery"],
            script: "function a(){console.log('hello from function a')}"
        },
        "portal": {
            name: "portal 123",
            cdn: ["jquery"],
            script: "console.log('dep trai qua')"
        }
    },
    cdns: {
        "bootstrap": [
            "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css",
            "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js"
        ],
        "jquery": ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"]
    }
}
 */
let db = {
    scripts: {},
    cdns: {}
}

chrome.storage.sync.get(db, function (data) {
    console.log(data);
    db = data;

    /* 
    #editscript=jquery
    #editcdn
    #addscript
    #addcdn 

     */

    let {
        scripts,
        cdns
    } = db

    let href = location.href
    let command = href.split("#")[1]
    if (command.startsWith("editscript")) {
        let key = command.split("=")[1]
        document.querySelector("title").textContent = "Edit " + key
        if (contain(scripts, key)) {

            let script = scripts[key]

            let listcdn = ""
            Object.keys(cdns).forEach(function (key) {
                if (script.cdn.indexOf(key) != -1) {
                    listcdn += `
            <label for="${key}">${key}</label><input type="checkbox" name="${key}" checked>
            `
                } else
                    listcdn += `
            <label for="${key}">${key}</label><input type="checkbox" name="${key}">
            `
            })
            let div = document.createElement("div")
            div.className = "div-modify"
            let html = `
            <h2>Modify Scripts</h2>
            <button id="btn-remove">Remove</button><br>
            <label for="input-name">Name</label><br>
            <input type="text" name="input-name" id="input-name" size="30" value="${script.name}""><br>
            <br>
            <label for="cars">Required CDN:</label>
            <ul id="div-cdns collapsible">
            ${listcdn}
            </ul>
            <label for="ta-script">Scripts</label><br>
            <textarea name="ta-script" cols="70" rows="30" >${script.script}</textarea>
            <br>
    `
            div.innerHTML = html
            document.getElementById("container").appendChild(div)
            document.getElementById("btn-save").addEventListener("click", function (event) {
                saveScript(key)
            })
        }
    } else if (command.startsWith("editcdn")) {
        document.querySelector("title").textContent = "Edit CDNs"

        let div = document.createElement("div")
        div.className = "div-modify"
        let html = `
        <br>
        <label for="textarea-cdn">Modifiy CDNs</label><br>
        <textarea name="textarea-cdn" cols="70" rows="30">${JSON.stringify(cdns)}</textarea>
        <br>
        `
        div.innerHTML = html
        document.getElementById("container").appendChild(div)

    } else if (command.startsWith("addscript")) {

    }
})

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function saveScript(key) {
    console.log({
        key
    });

    let inputName = document.querySelector("#input-name").value
    let script = document.querySelector("textarea").value
    let checkBoxList = document.querySelectorAll("input[type='checkbox']")

    let checkedList = []
    checkBoxList.forEach(checkbox => {
        if (checkbox.checked)
            checkedList.push(checkbox.name)
    })

    console.log(db.scripts);
    console.log(db.scripts[key]);



    delete db.scripts[key]
    console.log("deleted " + key);

    console.log("deleted:", db.scripts);

    let scriptObj = {
        name: inputName,
        cdn: checkedList,
        script: script
    }
    let newKey = createKey(inputName);

    db.scripts[newKey] = scriptObj;

    console.log("new", db);

    chrome.storage.sync.set(db)

}

function createKey(name = "") {
    return name.replace(" ", "_").trim()
}

function contain(obj, key) {
    console.log("check contains key");
    
    console.log(obj,key);
    
    return Object.keys(obj).indexOf(key) != -1
}