let db2 = {
    'https://glyph.medium.com/css/e/sr/latin/e/ssr/latin/e/ssb/latin/m2.css': 'assets/css/medium.css',
    'https://s.gr-assets.com/assets/gr/fonts-e256f84093cc13b27f5b82343398031a.css': 'assets/css/goodreads.css',
    '.+sayHi.js': '',
    'https://91porn.com/videojs/nuevo.min.js': 'https://cdn.jsdelivr.net/gh/LongNghia/Hook-Script-Resources/nuevo.min.js'
}

let db = null

let submitBtn, toast, addBtn, hooksContainer

submitBtn = document.getElementById("submit")
toast = document.getElementById("toast")
addBtn = document.getElementById("add")
hooksContainer = document.getElementById("hooks-container")

getValue().then(data => {
    db = data
    initHooks()

    submitBtn.addEventListener("click", savehooks)
    addBtn.addEventListener("click", addHook)

    hookRemoveListener()
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
                    savehooks();
                    break;
                case 'a':
                    event.preventDefault();
                    addHook("focus");
                    break;
                default:
                    return;
            }
        }
    }, true
);

function initHooks() {
    let hooksKey = Object.keys(db)

    for (let i = 0; i < hooksKey.length; i++) {
        addHook(null, hooksKey[i], db[hooksKey[i]]["target"], db[hooksKey[i]]["active"]) //event=null
    }
}

function hookRemoveListener() {
    let hooksRemove = document.getElementsByClassName("hook-remove")
    for (let i = 0; i < hooksRemove.length; i++) {
        let hookRemove = hooksRemove[i]
        hookRemove.addEventListener("click", function removeHook(event) {
            console.log("[hookRemove] removed hook " + i);
            hooksContainer.removeChild(hookRemove.parentNode)
        })
    }
    // savehooks(null)
}


function savehooks(event) {
    let hooks = document.getElementsByClassName("hook");
    let newDb = {}
    for (let i = 0; i < hooks.length; i++) {
        let hookSrc = hooks[i].querySelector(".hook-src")
        let hookDes = hooks[i].querySelector(".hook-des")
        let hookActive = hooks[i].querySelector(".hook-active input")
        let curTarget = {
            "target": hookDes.textContent,
            "active": hookActive.checked
        }

        newDb[hookSrc.textContent] = curTarget
        // newDb[String(hookSrc.textContent)] = curTarget
    }
    console.log(newDb);
    chrome.storage.local.clear(function () {
        if (chrome.runtime.lastError) {
            setToast("Save failed!!", 2000)
        } else {
            setValue(newDb).then(res => console.log(res))

            chrome.runtime.sendMessage({
                action: 'SAVE_HOOKS',
                payload: newDb
            })

            setToast("saved!")
        }
    })

}

function removeHook(key) {
    chrome.storage.local.remove([key], function () {
        var error = chrome.runtime.lastError;
        if (error) {
            setToast(error, 2000)
        }
    })
}

function setToast(text, timeout = 1500) {
    toast.textContent = text
    setTimeout(() => {
        toast.textContent = ""
    }, timeout);
}

function addHook(event, hookSrc = "", hookDes = "", active = true) {
    let input = active ? `<input type="checkbox" checked>` : `<input type="checkbox">`
    let html = `        <div class="hook">
    <div class="hook-src" contenteditable="true">${hookSrc}</div>
    <div class="hook-des" contenteditable="true">${hookDes}</div>
    <label class="hook-active">
      ${input}
      <span class="slider round"></span>
    </label>
    <button class="hook-remove"><i class="fa fa-trash"></i></button>
    </div>`
    hooksContainer.insertAdjacentHTML("afterbegin", html)
    hooksContainer.querySelector(".hook-remove").addEventListener("click", function removeHook(event) {
        console.log("[hookRemove] removed hook ");
        hooksContainer.removeChild(this.parentNode)
    })
    if (event) hooksContainer.querySelector("div.hook-src").focus()
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

// chrome.storage.onChanged.addListener(function (changes) {
//     chrome.storage.local.get(db, function (data) {
//         if (data)
//             db = data;
//     })
// });