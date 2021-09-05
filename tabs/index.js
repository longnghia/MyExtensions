function getHTMLlinks(tabs) {
  var link = "";
  tabs.forEach((tab) => {
    if (tab.favIconUrl)
      link += ` <div>
                    <img src=${tab.favIconUrl} alt ="favicon" height="25px" width="25px"/>
                  </div>`;
    link += `
      <a href=${tab.url}>${tab.url}</a><br>`;
  });
  return link;
}

function addLinks(tabs) {
  link = getHTMLlinks(tabs);
  document.getElementById("collection").innerHTML = link;
}

function openAll(tabs) {
  console.log("here i am");
  var button = document.getElementById("open-all");
  var open = function () {
    tabs.forEach((tab) => {
      window.setTimeout(async function () {
        await window.open(tab.url);
      }, 500);
    });
  };

  button.addEventListener("click",open);
}
