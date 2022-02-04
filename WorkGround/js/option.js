const db2 = {
    omniboxs: [
        {
            source: "paste",
            dest: "localhost/paste"
        },
        {
            source: "format",
            dest: "localhost/paste"
        },
    ],
    background: "../mylivewallpapers.com-Yellow-Space-Suit-Girl.mp4"
}

let db = { omniboxs: [], background: [] }

let submitBtn, toast, addBtn, omniboxsContainer

submitBtn = document.getElementById("submit")
toast = document.getElementById("toast")
addBtn = document.getElementById("add")
omniboxsContainer = document.getElementById("omniboxs-container")
previewImg = document.querySelector("#preview > img")

getValue().then(data => {
    db = data
    console.log("[init db]", db)
    /* omnibox */
    initOmniboxs()

    submitBtn.addEventListener("click", saveomniboxs)
    addBtn.addEventListener("click", addOmnibox)

    omniboxRemoveListener()

    /* background image */
    document.getElementById("background").innerHTML = createMenu()
    var selectList = document.getElementById("WG-select");
    if (previewImg)
        previewImg.src = `../assests/thumbnails/${selectList.options[+selectList.value].text}.jpg`
    function submit(event) {
        let type = selectList.value;
        console.log('select: ' + type);
        localStorage["background"] = +type // string to int

        if (previewImg)
        previewImg.src = `../assests/thumbnails/${selectList.options[+selectList.value].text}.jpg`
    }
    selectList.addEventListener('change', function () {
        submit()
    })
})

/* 
shortcuts
ctrl s: save
ctrl a: add item
*/
window.addEventListener("keydown",
    function (event) {
        if (event.ctrlKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    saveomniboxs();
                    break;
                case 'a':
                    event.preventDefault();
                    addOmnibox("focus");
                    break;
                default:
                    return;
            }
        }
    }, true
);

function initOmniboxs() {
    if (db && db.omniboxs && db.omniboxs.length) {
        for (let i = db.omniboxs.length - 1; i >= 0; i--) {
            addOmnibox(null, db.omniboxs[i]["src"], db.omniboxs[i]["des"], db.omniboxs[i]["active"]) //event=null
        }
    } else {
        console.log("db null!")
    }

}

function omniboxRemoveListener() {
    let omniboxsRemove = document.getElementsByClassName("omnibox-remove")
    for (let i = 0; i < omniboxsRemove.length; i++) {
        let omniboxRemove = omniboxsRemove[i]
        omniboxRemove.addEventListener("click", function removeOmnibox(event) {
            console.log("[omniboxRemove] removed omnibox " + i);
            omniboxsContainer.removeChild(omniboxRemove.parentNode)
        })
    }
    // saveomniboxs(null)
}


function saveomniboxs(event) {
    let omniboxs = document.getElementsByClassName("omnibox");
    let newOmniboxs = []
    for (let i = 0; i < omniboxs.length; i++) {
        let omniboxSrc = omniboxs[i].querySelector(".omnibox-src")
        let omniboxDes = omniboxs[i].querySelector(".omnibox-des")
        let omniboxActive = omniboxs[i].querySelector(".omnibox-active input")
        let curTarget = {
            "target": omniboxDes.textContent,
            "active": omniboxActive.checked
        }
        let omnibox = {
            src: omniboxSrc.textContent,
            des: omniboxDes.textContent,
            active: omniboxActive.checked
        }
        if (!omnibox.src || !omnibox.des) {
            continue
        }
        newOmniboxs.push(omnibox)
    }
    console.log("new db: ", newOmniboxs);

    db.omniboxs = newOmniboxs,
        chrome.storage.local.clear(function () {
            if (chrome.runtime.lastError) {
                setToast("Save failed!!", 2000)
            } else {
                setValue(db).then(res => console.log(res))

                // chrome.runtime.sendMessage({
                //     action: 'SAVE_ALL',
                //     payload: db
                // })

                setToast("saved!")
            }
        })

}

function removeOmnibox(key) {
    let omniboxs = db.omniboxs.filter(omnibox => omnibox.src != key)
    db.omniboxs = omniboxs
    setValue(db).then(res => console.log(res))

}

// function setToast(text, timeout = 1500) {
//     toast.textContent = text
//     setTimeout(() => {
//         toast.textContent = ""
//     }, timeout);
// }

function setToast(text = 'success!', timeout = 1500, icon = 'success') {
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
function addOmnibox(event, omniboxSrc = "", omniboxDes = "", active = true) {
    let input = active ? `<input type="checkbox" checked>` : `<input type="checkbox">`
    let html = `        <div class="omnibox">
    <div class="omnibox-src" contenteditable="true">${omniboxSrc}</div>
    <div class="omnibox-des" contenteditable="true">${omniboxDes}</div>
    <label class="omnibox-active">
      ${input}
      <span class="slider round"></span>
    </label>
    <button class="omnibox-remove"><i class="fa fa-trash"></i></button>
    </div>`
    omniboxsContainer.insertAdjacentHTML("afterbegin", html)
    omniboxsContainer.querySelector(".omnibox-remove").addEventListener("click", function removeOmnibox(event) {
        console.log("[omniboxRemove] removed omnibox ");
        omniboxsContainer.removeChild(this.parentNode)
    })
    if (event) omniboxsContainer.querySelector("div.omnibox-src").focus()
}

function getValue(key = null) {
    return new Promise(function (resolve, reject) {
        if (!chrome || !chrome.storage || !chrome.storage.local) {
            return reject(new Error('Storage required'));
        }

        chrome.storage.local.get(key, function (val) {
            if (val) {
                return resolve(val);
            }
            resolve();
        });
    });
};

function setValue(obj) {
    return new Promise(function (resolve, reject) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(obj,
                function () {
                    resolve("[setValue] success");
                }
            );
        }
    });
};


function createMenu() {
    let optionList = ''
    if (db && db.background) {
        for (let i in db.background) {
            if (localStorage["background"] && i == localStorage["background"])
                optionList += `<option value="${i}" selected>${db.background[i]}</option>`
            else
                optionList += `<option value="${i}">${db.background[i]}</option>`
        }
        console.log("[WG] localStorage:", localStorage["background"]);

    } else {
        console.log("db null");

    }
    const style = "background-color: antiquewhite;font-weight: 600;border-radius: 10px;outline: none;"
    let html = `
    <!--<label>Choose sort type:</label> -->
    <select id="WG-select" style="${style}">
    ${optionList}
    </select>
    <!--<input type="submit" id='WG-submit' value="Submit">-->
    `
    return html
}