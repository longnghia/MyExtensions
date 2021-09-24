console.log("hi from super formatter with love");
a()



if (document.readyState !== 'loading') {
    start()
} else {

    document.addEventListener("DOMContentLoaded", start)
}

function start(event) {
    console.log("on DomContentLoaded");
    console.log("href", location);


    let pre, textContent, pathname, enabled = false,
        port, head



    port = chrome.runtime.connect({
        name: "superformatter"
    })
    port.onMessage.addListener(function (msg) {
        console.log(msg);

    })
    pathname = location.pathname
    if (pathname.endsWith("user.js")) {
        console.log("Not apply on userscript");

    } else if (pathname.endsWith(".js")) {
        enabled = true
    }
    if (enabled) {
        head = document.head || document.body
        createEle(head, {
            name: "style",
            attr: {
                id: "sfcss"
            },
            content: `.hidden{display:none}`
        })
        createEle(document.body, {
            name: "img",
            attr: {
                src: chrome.extension.getURL("../icon/icons8-v-live-128-color.png")
            }
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

        // createEle(head, {
        //     name: "script",
        //     attr: {
        //         src: chrome.extension.getURL("js/lib/codemirror.js")
        //     }
        // })


        pre = document.querySelector("pre")
        // if (pre && pre.textContent) {
        //     console.log(pre)
        //     textContent = pre.textContent

        //     port.postMessage({
        //         action: "SEND-TEXT",
        //         data: textContent
        //     })
        // }

        /* beautify */
        let tarea = createEle(document.body, {
            name: "textarea",
            attr: {
                id: "tarea"
            },
            content: "let a=123"
        })

        let myCodeMirror2 = CodeMirror.fromTextArea(document.getElementById("tarea"), {
            lineNumbers: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete"
            },
            mode: {
                name: "javascript",
                globalVars: true
            }
        });


        let btnFormat = createEle(document.body, {
            name: "button",
            content: "Execute"
        })
        btnFormat.addEventListener("click", function () {
            pre.className = "hidden"

            console.log(pre.innerText);
            myCodeMirror2.setValue(pre.innerText)
            console.log(myCodeMirror2);

            let text = myCodeMirror2.getValue()
            let btext = js_beautify(text)
            console.log(btext);

            myCodeMirror2.setValue(btext)
        })

        document.addEventListener("keydown", function (e) {
            if (e.ctrlKey && e.keyCode === 13) {
                btnFormat.click();
            }
        })
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
