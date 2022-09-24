/* 
bblelpkjpeaahgfmpjphgebjnfjofkci
https://stackoverflow.com/questions/9515704/use-a-content-script-to-access-the-page-context-variables-and-functions

    <script type="text/javascript" src="newtab.bundle.js"></script>
    code syntax color
    delete myjsonobj['otherIndustry'];
*/

// console.log("hi from SuperInject");

let db = {
    dbScripts: [],
    dbCdns: [],
    dbCSSs: []
}

chrome.storage.local.get(db, function (data) {
    // console.log(data);
    db = data;
})



function injectCDN(cdn = "") {
    let name = "script"

    if (cdn.match(".css")) {
        name = "link"
    }
    return new Promise((resolve, reject) => {
        if (!cdnExistes(cdn)) {
            let ele = document.createElement(name)

            if (name == "script")
                ele.setAttribute("src", cdn)
            else if (name == "link") {
                ele.setAttribute("rel", "stylesheet")
                ele.setAttribute("href", cdn)
            }

            (document.head || document.documentElement).appendChild(ele);

            ele.onload = function () {
                showToast("CDN injected!")
                resolve("inject " + cdn + " successfully!")
            }
            ele.onerror = function () {
                reject("[onerror] could not load cdn")
            }
        } else {
            reject(cdn + " already exist")
        }
    })
}

function injectScript(code = "") {
    if (code) {
        var script = document.createElement('script');
        script.textContent = code;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
        showToast()
    }
}
/* 
inject css
https://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
*/
function injectCss(css = "") {
    let style = document.createElement('style');
    (document.head || document.documentElement).appendChild(style);
    style.setAttribute("type", 'text/css');
    style.textContent = css
    console.log("injecting css ...");
    showToast("CSS injected!")
}

function cdnExistes(src) {
    return document.querySelector(`[src="${src}"]`) != null
}

// injectCDN("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css")
//     .then(res => {
//         console.log(res)
//     })
//     .catch(err => {
//         console.log(err)
//     })

// let {
//     name,
//     cdn,
//     script
// } = db.collection.pin_get

// cdn.forEach(url => {
//     injectCDN(url)
//         .then(res => {
//             console.log(res)
//         })
//         .catch(err => {
//             console.log(err)
//         })
// })

// injectScript(script)

chrome.runtime.onMessage.addListener(function (message, messageSender, sendResponse) {
    chrome.storage.local.get(db, function (data) {


        db = data
        let { dbScripts, dbCSSs, dbCdns } = db;

        if (message.action == 'inject-cdn') {
            let index = message.payload
            let  cdn = dbCdns[index]
            console.log('do inject-cdn', cdn.name);

            cdn.cdns.forEach(link => {
                if (link.length)
                    injectCDN(link)
                        .then(res => {
                            console.log(res)
                        })
                        .catch(err => {
                            console.log(err)
                        })
            })
        } else if (message.action == 'inject-script') {
            let index = message.payload
            let {
                name,
                cdns,
                script
            } = dbScripts[index]
            if (dbCdns.length > 0) {
                console.log("injecting: " + name + " ...");
                console.log(cdns)
                l = cdns && cdns.length || 0
                l && dbCdns.some((item) => {
                    if (l && item.name === cdn[--l]) {
                        item.cdns.forEach(link => {
                            if (link)
                                injectCDN(link)
                                    .then(res => {
                                        console.log(res)
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    })
                        })
                    }
                    if (l == 0)
                        return true;
                })
            }

            injectScript(script)
        }
    })

});


function showToast(str = "Script injected!") {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'success',
        title: str
    })
}

/* 
add css
 */
chrome.storage.local.get(db, function (data) {
    // console.log("updating database...");
    // console.log(data);

    db = data
    let cssList = db.dbCSSs
    cssList.some(css => {
        if (css.match && new RegExp(css.match).test(window.location.href)) {
            injectCss(css.css)
            return true
        }
    })
    // if (location.href.match("viblo")) {
    //     injectCss(`
    // h1{font-size: 50px;color: red !important;}
    // `);
    // }
})

