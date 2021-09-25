// console.log("hi from super formatter with love");
// a()



if (document.readyState !== 'loading') {
    start()
} else {
    // add css, js src when <head> appears
    document.addEventListener("DOMContentLoaded", start)
}

function start(event) {
    let pre, textContent, pathname, enabled = false,
        port, head, baseDiv, container

    baseDiv = document.createElement("div")
    /* 
        port = chrome.runtime.connect({
            name: "superformatter"
        })
        port.onMessage.addListener(function (msg) {
            console.log(msg);

        })
         */
    pathname = location.pathname
    if (pathname.endsWith("user.js")) {
        console.log("Not apply on userscript");

    } else if (pathname.endsWith(".js")) {
        enabled = true
    }
    if (enabled) {
        head = document.head || document.body
        /* 
        append css code, css href, js src
        */
        createEle(head, {
            name: "style",
            attr: {
                id: "sfcss"
            },
            content: `.hidden{display:none}`
        })


        createEle(head, {
            name: "link",
            attr: {
                rel: "stylesheet",
                href: chrome.extension.getURL("js/lib/codemirror.css")
            }
        })
        createEle(head, {
            name: "link",
            attr: {
                rel: "stylesheet",
                href: chrome.extension.getURL("js/lib/mycss.css")
            }
        })

        // this is ok
        /*         
                createEle(container, {
                    name: "img",
                    attr: {
                        src: chrome.extension.getURL("../icon/icons8-v-live-128-color.png"),
                        width: "15px",
                        height: "auto"
                    }
                })
                createEle(head, {
                    name: "script",
                    attr: {
                        src: chrome.extension.getURL("js/lib/codemirror.js")
                    }
                })
         */
        pre = document.querySelector("pre")
        container = createEle(document.body, {
            name: "div",
            attr: {
                id: "container"
            }
        })

        /* beautify */
        let tarea = createEle(container, {
            name: "textarea",
            attr: {
                id: "tarea",
                class: "hidden",
            },
            content: js_beautify(pre.textContent)
        })

        let codeMirrow;


        let btnFormat = createEle(document.body, {
            name: "button",
            content: "Execute"
        })


        /*  false if lineNumbers */
        // togglePre()
        // codeMirrow = CodeMirror.fromTextArea(tarea, {
        //     // lineNumbers: true,
        //     lineWrapping: true,

        //     mode: {
        //         name: "javascript",
        //         // globalVars: true
        //     }
        // });
        // codeMirrow.setSize(null, "100vh")


        btnFormat.addEventListener("click", function () {
            console.log("[SF] btnFormat clicked");
            togglePre()
            addMirrow()
        })

        document.addEventListener("keydown", function (e) {
            if (e.ctrlKey && e.keyCode === 13) {
                btnFormat.click();
            }
        })
    }

    function addMirrow() {
        // add codemirrow from textarea
        let alreadyCM = document.querySelector("div.CodeMirror.cm-s-default")
        if (alreadyCM) {
            alreadyCM.remove()
        } else {
            codeMirrow = CodeMirror.fromTextArea(tarea, {
                lineNumbers: true,
                lineWrapping: true,
                mode: {
                    name: "javascript",
                    globalVars: true
                }
            });
            codeMirrow.setSize(null, "100vh")
        }
    }

    function togglePre() {
        if (pre.className != "hidden") {
            pre.className = "hidden"
            container.className = ""
        } else {
            pre.className = ""
            container.className = "hidden"
        }
    }

}

function createEle(parent, obj) {
    let ele = document.createElement(obj.name)
    if (obj.attr) {
        for (let i = 0, l = Object.keys(obj.attr).length; i < l; i++) {
            let key = Object.keys(obj.attr)[i]
            ele.setAttribute(key, obj.attr[key])
        }
    }
    if (obj.content) {
        ele.textContent = obj.content
    }
    parent.appendChild(ele)
    return ele
}