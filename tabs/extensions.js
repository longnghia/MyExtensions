function getHTMLlinks(exts) {
  var link = "";
  var extIcon =
    "https://icons.iconarchive.com/icons/untergunter/leaf-mimes/24/extension-icon.png";
  exts.forEach((ext, index) => {
    link += `<div> ${index + 1}. `;
    if (ext.icons) {
      link += `<img src=${ext.icons[0].url} alt ="favicon" height="16px" width="16px"/>`;
    } else
      link += `<img src="icons/extension-icon.png" alt ="favicon" height="16px" width="16px"/>`;
    link += ` 
                      
                      <a href=${ext.homepageUrl}>${ext.name}</a>
                </div>
                <div class="hidden" style="display: none;">${ext.description}</div>
                    
                    `;
  });
  return link;
}

function addExtLinks(exts) {
  var enabled = exts.filter((e) => {
    return e.enabled;
  });
  var disabled = exts.filter((e) => {
    return !e.enabled;
  });

  document.getElementById("enabled").innerHTML = getHTMLlinks(enabled);
  document.getElementById("disabled").innerHTML = getHTMLlinks(disabled);
}

function addToggleShow(){
    var but = document.getElementById("toggleShow");
    but.addEventListener("click",toggleDisplay);
}

function toggleDisplay(ele) {
  console.log(ele);
  hidden = Array.from(document.getElementsByClassName("hidden"));
  hidden.forEach((hid) => {
    if (hid.style.display == "none") {
      hid.style.display = "block";
    } else {
      hid.style.display = "none";
    }
  });
}

