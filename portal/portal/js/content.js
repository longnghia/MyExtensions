document.addEventListener("DOMContentLoaded", function (event) {
  var ifrm = document.createElement("iframe");
  ifrm.setAttribute("id", "ifrm"); // assign an id

  // assign url
  ifrm.setAttribute("src", chrome.extension.getURL("/pages/chart.html"));

  document.body.appendChild(ifrm);
});
