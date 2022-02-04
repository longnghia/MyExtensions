let container = document.getElementById("container")
let status = document.getElementById("status")
document.onpaste = async function (event) {
    event.preventDefault()
    document.getElementById("container").style.display = "block"
    
    // setTimeout(() => {
    //     document.getElementById("container").style.display = 'none'
    // }, 20000);

    let items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let itemsCount = items.length
    for (index in items) {

        let item = items[index];
        console.log(item.type);
        if (item.kind === 'file') {
            let blob = item.getAsFile();
            let reader = new FileReader();

            let data = [new ClipboardItem({
                [item.type]: blob
            })];

            reader.onload = async function (event) {
                let img = document.createElement("IMG")
                img.src = event.target.result
                await createDiv(img, data)
            }; // data url!
            reader.readAsDataURL(blob);
        } else if (item.kind == "string" && item.type == "text/plain") {
            item.getAsString(async function (domString) {
                let text = document.createElement("div")
                text.innerText = domString

                let blob = new Blob([String(domString)], {
                    type: "text/plain"
                });

                let data = [new ClipboardItem({
                    ["text/plain"]: blob
                })];
                await createDiv(text, data)
            })
        } else {
            console.log("type undefinded" + item.type);

        }
    }
}

function createDiv(ele, clipboardItem) {
    let div = document.createElement("DIV")
    div.className = "item"
    div.appendChild(ele)
    // div.style.backgroundColor = randColor()
    // let cpyBtn = document.createElement("BUTTON")
    // div.appendChild(cpyBtn)
    // cpyBtn.className = "cpy-btn"
    // cpyBtn.innerText = "Copy"
    // cpyBtn.addEventListener("click", async function () {
    //     await setClipboard(clipboardItem)
    // })
    container.insertBefore(div, container.childNodes[0])
    container.innerHTML = ''
    container.appendChild(div)
}

async function setClipboard(data) {
    try {
        await navigator.clipboard.write(data);
        // console.log(data);
        if (data[0].types[0].startsWith("text"))
            setStatus("Text copied")
        else if (data[0].types[0].startsWith("image"))
            setStatus("Image copied")
        else
            setStatus("copied")
    } catch (err) {
        console.error(err.name, err.message);
    }
}

function setStatus(str) {
    status.innerText = str
    window.setTimeout(function () {
        status.innerText = ""
    }, 1000)
}

function randColor() {
    function randOne() {
        let max = 222;
        let min = 135;
        return Math.floor(Math.ceil(Math.random() * (max - min)) + min)
    }
    return `rgb(${randOne()},${randOne()},${randOne()})`
}