console.log(123);

// fetch("../data.json")
// .then(data=>data.json())
// .then(res=>{console.log(res)})

db = {
    "workspaces": [{
            "title": "trash26 aide, toast",
            "resources": [{
                "title": "Android & iOS MODs, Mobile Games & Apps",
                "url": "https://platinmods.com/threads/auto-toaster-auto-inject-toast-in-apk-file.61526/"
            }, {

                "title": "LEARN MODDING TODAY FOR FREE!-Platinmods.com",
                "url": "https://platinmods.com/threads/basics-about-android-apk-modding-in-general-learn-modding-today-for-free.19772/"
            }]
        }, {
            "title": "unsplash lorem",
            "resources": [{
                "title": "21 of the Best Placeholder Image Generators",
                "url": "https://loremipsum.io/21-of-the-best-placeholder-image-generators"
            }, {

                "title": "Lorem Picsum",
                "url": "https://picsum.photos/"
            }]
        },
        {
            "title": "trash26 aide, toast",
            "resources": [{
                "title": "Android & iOS MODs, Mobile Games & Apps",
                "url": "https://platinmods.com/threads/auto-toaster-auto-inject-toast-in-apk-file.61526/"
            }, {

                "title": "LEARN MODDING TODAY FOR FREE!-Platinmods.com",
                "url": "https://platinmods.com/threads/basics-about-android-apk-modding-in-general-learn-modding-today-for-free.19772/"
            }]
        }, {
            "title": "unsplash lorem",
            "resources": [{
                "title": "21 of the Best Placeholder Image Generators",
                "url": "https://loremipsum.io/21-of-the-best-placeholder-image-generators"
            }, {

                "title": "Lorem Picsum",
                "url": "https://picsum.photos/"
            }]
        },
        {
            "title": "trash26 aide, toast",
            "resources": [{
                "title": "Android & iOS MODs, Mobile Games & Apps",
                "url": "https://platinmods.com/threads/auto-toaster-auto-inject-toast-in-apk-file.61526/"
            }, {

                "title": "LEARN MODDING TODAY FOR FREE!-Platinmods.com",
                "url": "https://platinmods.com/threads/basics-about-android-apk-modding-in-general-learn-modding-today-for-free.19772/"
            }]
        }, {
            "title": "unsplash lorem",
            "resources": [{
                "title": "21 of the Best Placeholder Image Generators",
                "url": "https://loremipsum.io/21-of-the-best-placeholder-image-generators"
            }, {

                "title": "Lorem Picsum",
                "url": "https://picsum.photos/"
            }]
        },
        {
            "title": "trash26 aide, toast",
            "resources": [{
                "title": "Android & iOS MODs, Mobile Games & Apps",
                "url": "https://platinmods.com/threads/auto-toaster-auto-inject-toast-in-apk-file.61526/"
            }, {

                "title": "LEARN MODDING TODAY FOR FREE!-Platinmods.com",
                "url": "https://platinmods.com/threads/basics-about-android-apk-modding-in-general-learn-modding-today-for-free.19772/"
            }]
        }, {
            "title": "unsplash lorem",
            "resources": [{
                "title": "21 of the Best Placeholder Image Generators",
                "url": "https://loremipsum.io/21-of-the-best-placeholder-image-generators"
            }, {

                "title": "Lorem Picsum",
                "url": "https://picsum.photos/"
            }]
        },
        {
            "title": "trash26 aide, toast",
            "resources": [{
                "title": "Android & iOS MODs, Mobile Games & Apps",
                "url": "https://platinmods.com/threads/auto-toaster-auto-inject-toast-in-apk-file.61526/"
            }, {

                "title": "LEARN MODDING TODAY FOR FREE!-Platinmods.com",
                "url": "https://platinmods.com/threads/basics-about-android-apk-modding-in-general-learn-modding-today-for-free.19772/"
            }]
        }, {
            "title": "unsplash lorem",
            "resources": [{
                "title": "21 of the Best Placeholder Image Generators",
                "url": "https://loremipsum.io/21-of-the-best-placeholder-image-generators"
            }, {

                "title": "Lorem Picsum",
                "url": "https://picsum.photos/"
            }]
        },


    ],
    "config":{
        "livewall":true
    }
}

console.log(db);

let container = document.getElementById("container")
let sideBar = document.getElementById("sidebar")
let main = document.getElementById("main")
let divBase = document.createElement("div")
let resizer = document.querySelector("div.resize-handle--x")
let resizing = false
let {
    workspaces
} = db



if (Array.isArray(workspaces) && workspaces.length > 0) {
    let htmlSidebar = `<div class="sidebar-header">Aside<hr /></div>`
    for (let i = 0, l = workspaces.length; i < l; i++) {
        let htmlSpace = ""
        let {
            title,
            resources
        } = workspaces[i]
        htmlSidebar +=
            `<div class="sidebar-space" data-index-space="${i}">
                ${title}
            </div>`

        // list resources in main
        for (let j = 0, k = resources.length; j < k; j++) {
            htmlSpace +=
                `<div class="main-space-item" data-index-item="${j}">
                <a href=${resources[j].url}>${resources[j].title}</a>
            </div>`
        }
        let mainSpace = divBase.cloneNode(false)
        mainSpace.innerHTML = htmlSpace
        mainSpace.classList.add("main-space")
        mainSpace.classList.add("hidden")
        mainSpace.setAttribute("data-index-space", `${i}`)
        main.appendChild(mainSpace)
    }
    sideBar.innerHTML = htmlSidebar
} else {
    console.log("workplaces false:", workspaces);
}

let spaceList = document.getElementsByClassName("sidebar-space")
for (let space of spaceList) {
    space.addEventListener("click", spaceClick)
}

/* 
default first space active
 */
toggleMainSpace(document.querySelector(`div.main-space[data-index-space="0"]`))
toggleSidebarSpace(document.querySelector(`div.sidebar-space[data-index-space="0"]`))



function spaceClick(ev) {
    let currentActiveSpace = document.querySelector("div.sidebar-space.active")
    if (currentActiveSpace) {
        toggleSidebarSpace(currentActiveSpace)
    }

    let currentActiveMainSpace = document.querySelector("div.main-space.active")
    if (currentActiveMainSpace) {
        toggleMainSpace(currentActiveMainSpace)
    }
    // console.log(this); // == ev.target
    toggleSidebarSpace(this)

    let spaceIndex = this.getAttribute("data-index-space")
    let activeMainSpace = document.querySelector(`div.main-space[data-index-space="${spaceIndex}"]`)
    toggleMainSpace(activeMainSpace)
}

function toggleMainSpace(el) {
    if (el.classList.contains("hidden")) {
        el.classList.remove("hidden")
        el.classList.add("active")
    } else {
        el.classList.remove("active")
        el.classList.add("hidden")
    }

}

function toggleSidebarSpace(el) {
    if (el.classList.contains("active")) {
        el.classList.remove("active")
    } else {
        el.classList.add("active")
    }
}

/* resize stuff */
/* resizer.addEventListener("mousedown", function(){
    console.log("mouse down");
    
    resizing = true
})
resizer.addEventListener("mouseup", function(){
    resizing = false
    console.log("mouseup");
    
})
resizer.addEventListener("mousemove", function doResize(event){
    event.preventDefault();
    event.stopPropagation();
    if (resizing){
        console.log(event.screenX-1282);
        resizer.offsetX = event.screenX+"px"
    }
}) */