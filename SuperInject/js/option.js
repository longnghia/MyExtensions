
let db = {
    dbScripts: [],
    dbCdns: [],
    dbCSSs: []
}

let toast = document.getElementById("toast")
let btnSave = document.getElementById("btn-save");
document.getElementById("btn-add").click = function () {
    let url = chrome.extension.getURL("/html/option.html") + `#addscript`
    console.log("redirect to %s", url);
    chrome.tabs.update(undefined, {
        url
    });
}

chrome.storage.local.get(db, function (data) {
    console.log(data);
    db = data;

    /* 
    #editscript=jquery
    #editcdn
    #addscript
    #editcss
     */

    let {
        dbScripts,
        dbCdns,
        dbCSSs
    } = db

    let href = location.href
    let command = href.split("#")[1] ? href.split("#")[1] : ''
    if (command.startsWith("editscript")) {
        let index = command.split("=")[1]
        let script = dbScripts[index]
        document.querySelector("title").textContent = "Edit " + script.name

        createEditorLayout(index, dbCdns, "Modify Scripts")

        btnSave.textContent = "Modify"

        //add remove btn
        let btnRemove = document.createElement("button")
        btnRemove.textContent = "Remove"
        btnRemove.setAttribute("id", "btn-remove")
        btnRemove.addEventListener("click", function (event) {

            // db.dbScripts.splice(index,1);
            console.log("remove script:", db.dbScripts.splice(index, 1));

            chrome.storage.local.set(db, function () {
                save2firebase()
                showToast("Removed")
                // redirect to add script page
                let url = chrome.extension.getURL("/html/option.html") + `#addscript`
                console.log("redirect to %s", url);
                window.close()
                chrome.tabs.create({
                    url
                }, function () { console.log("open new tab") });
            })
        })
        document.querySelector("div.div-modify").appendChild(btnRemove)
    } else if (command.startsWith("addscript")) {

        createEditorLayout(-1, dbCdns, "Add Script")

    } else if (command.startsWith("editcdn")) {
        console.log('edit cdn');

        document.querySelector("title").textContent = "Edit CDNs"

        let div = document.createElement("div")
        div.className = "div-modify"
        let html = `
        <br>
        <label for="textarea-cdn">Modify CDNs</label><br>
        <textarea name="textarea-cdn" cols="100" rows="30">${js_beautify(JSON.stringify(dbCdns))}</textarea>
        <br>
        `
        div.innerHTML = html
        document.getElementById("container").appendChild(div)
        //save
        document.getElementById("btn-save").addEventListener("click", function (event) {
            try {
                db.dbCdns = JSON.parse(document.querySelector("textarea").value)
                chrome.storage.local.set(db, function () {
                    showToast("Saved")
                    save2firebase()
                    console.log(db);
                })
            } catch (e) {
                console.error("Cant not save: ", e)
                showToast(e, "error")
            }
        })

    } else if (command.startsWith("editcss")) {
        dbCSSs = dbCSSs ? dbCSSs : []
        document.querySelector("title").textContent = "Edit CSS"
        let div = document.createElement("div")
        div.className = "div-modify"
        let html = `
        <br>
        <label for="textarea-cdn">Modify CSSs</label><br>
        <textarea name="textarea-cdn" cols="100" rows="30">${js_beautify(JSON.stringify(dbCSSs))}</textarea>
        <br>
        `
        div.innerHTML = html
        document.getElementById("container").appendChild(div)
        //save
        document.getElementById("btn-save").addEventListener("click", function (event) {
            db.dbCSSs = JSON.parse(document.querySelector("textarea").value)
            chrome.storage.local.set(db, function () {
                save2firebase()
                showToast("Saved")
                console.log(db);

            })
        })

    }
})

/* 
shortcuts
ctrl s: save
*/
window.addEventListener("keydown",
    function (event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    document.getElementById("btn-save").click()
                    break;
                default:
                    return;
            }
        }
    }, true
);

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function saveScript(scriptIndex) {

    let inputName = document.querySelector("#input-name").value || ""
    let script = document.querySelector("textarea").value
    let checkBoxList = document.querySelectorAll("input[type='checkbox']")

    let checkedList = []
    checkBoxList.forEach(checkbox => {
        if (checkbox.checked)
            checkedList.push(checkbox.name)
    })

    if (inputName) {
        if (scriptIndex==-1 && scriptExist(inputName)) {
            showToast("Name existed!", "error")
            return;
        }
        let scriptObj = {
            name: inputName,
            cdns: checkedList,
            script: script
        }

        if (scriptIndex >= 0)
            db.dbScripts[scriptIndex] = scriptObj;
        else {

            db.dbScripts.push(scriptObj)
            scriptIndex = db.dbScripts.length - 1
        }


        console.log("Saved script: ", db.dbScripts[scriptIndex], db);

        chrome.storage.local.set(db, function () {
            console.log("save to local then sync...");
            showToast("Saved!")
            save2firebase()
        })


    } else {
        showToast("Invalid name", "error")
    }

}

function scriptExist(inputName) {
    return db.dbScripts.some(item =>
        item.name == inputName)
}


function createKey(name = "") {
    return name.replace(" ", "_").trim()
}

function contain(obj, key) {
    console.log("check contains key");

    console.log(obj, key);

    return Object.keys(obj).indexOf(key) != -1
}


function showToast(str = "Success", icon = "success", timer = 1500) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: timer,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: icon,
        title: str
    })
}

function createEditorLayout(scriptIndex, dbCdns, title) {
    let script
    if (scriptIndex < 0)
        script = {
            name: "",
            cdns: [],
            script: ""
        }
    else{
        script = db.dbScripts[scriptIndex];
    }

    console.log(script);
    
    let cdns = script.cdns
    l = cdns && cdns.length || 0
    let listcdn = ""
    dbCdns.forEach((item) => {
        let checked = ""
        if (l>0 && item.name === cdns[--l]) {
            checked = "checked"
        }
        listcdn += `
        <div class="div-cdn">
        <input type="checkbox" name="${item.name}" ${checked}>
        <label for="${item.name}">${item.name}</label>
        </div>`
    })


    let div = document.createElement("div")
    div.className = "div-modify"
    let html = `
    <h2>${title}</h2>
    <label for="input-name">Name</label><br>
    <input type="text" name="input-name" id="input-name" size="30" value="${script.name}""><br>
    <br>
    <label for="cars">Required CDN:</label>
    <div id="div-dbCdns">
    ${listcdn}
    </div>
    <label for="ta-script">Scripts</label><br>
    <textarea name="ta-script" cols="70" rows="30" >${script.script}</textarea>
    <br>
    `
    div.innerHTML = html
    document.getElementById("container").appendChild(div)
    //save
    document.getElementById("btn-save").addEventListener("click", function (event) {
        saveScript(scriptIndex)
    })
}

function save2firebase(){
    chrome.runtime.sendMessage({
        action: 'SAVE_DB',
    }, function(res){
        console.log(res);
    })
}
