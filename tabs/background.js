//ext's icon clicked
chrome.browserAction.onClicked.addListener(function () {
  var viewTabUrl = chrome.extension.getURL("index.html");
  var targetId = null;
  chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
    if (tabId != targetId || changedProps.status != "complete") return;
    chrome.tabs.onUpdated.removeListener(listener);

    chrome.tabs.query({}, function (tabs) {
      console.log("tabs here:");
      console.log(tabs);

      var views = chrome.extension.getViews();

      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewTabUrl) {
          view.addLinks(tabs);
          view.openAll(tabs);
          break;
        }
      }
    });
  });
  chrome.tabs.create({ url: viewTabUrl }, function (tab) {
    targetId = tab.id;
  });
});

//hotkey clicked
chrome.commands.onCommand.addListener(function (command) {
  if (command == "logTabs") {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      console.log("tabs here:");
      console.log(tabs);
      tabs_str = getHTMLlinks(tabs);
      filename = Date().split("GMT")[0].trim().replaceAll(" ", "_") + "_hiha";
      download(tabs_str, filename, "text/html");
    });

    //   // Get the currently selected tab
    //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    //     // Toggle the pinned status
    //     var current = tabs[0]
    //     chrome.tabs.update(current.id, {'pinned': !current.pinned});
    //   });
  } else if (command == "dublicateTab") {
    console.log("dublicating...");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      console.log("active tabs:");
      console.log(tabs);
      if (tabs.length>0)
	      chrome.tabs.duplicate(tabs[0].id);
	else
		console.log("no single active tab!")
    });
  }
});

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

///download file
function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

//CREATE MENU CONTEXT

// The onClicked callback function.
async function onClickHandler(info, tab) {
  if (info.menuItemId == "radio1" || info.menuItemId == "radio2") {
    console.log(
      "radio item " +
        info.menuItemId +
        " was clicked (previous checked state was " +
        info.wasChecked +
        ")"
    );
  } else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
    console.log(JSON.stringify(info));
    console.log(
      "checkbox item " +
        info.menuItemId +
        " was clicked, state is now: " +
        info.checked +
        " (previous state was " +
        info.wasChecked +
        ")"
    );
  } else if (info.menuItemId == "log-tab") {
    chrome.tabs.query({}, function (tabs) {
      console.log(tabs);
    });
  } else if (info.menuItemId == "log-ext") {
    chrome.management.getAll((e) => console.log(e));

    var viewExtUrl = chrome.extension.getURL("extensions.html");

    var targetId = null;
    chrome.tabs.onUpdated.addListener(function listener(tabId, changedProps) {
      if (tabId != targetId || changedProps.status != "complete") return;
      chrome.tabs.onUpdated.removeListener(listener);

      chrome.management.getAll((exts) => {
        var views = chrome.extension.getViews();

        for (var i = 0; i < views.length; i++) {
          var view = views[i];
          if (view.location.href == viewExtUrl) {
            view.addExtLinks(exts);
            view.addToggleShow();
            break;
          }
        }
      });
    });
    chrome.tabs.create({ url: viewExtUrl }, function (tab) {
      targetId = tab.id;
    });
  } else if (info.menuItemId == "open-all") {
    console.log("open all!!!");
    var script=`  urls = Array.from(document.getElementsByTagName("a")).map((url) => url.href);
    urls.forEach((url) => {
      window.open(url);
    });`
    await chrome.tabs.query({ active: true }, (tab) => {
      currentTab = tab[0];
      console.log(currentTab);
      chrome.tabs.executeScript(
        currentTab.id,
        { code: script },
        function (results) {
          console.log("x is ",results);
        }
      );
    });
  } else {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
  }
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function () {
  // Create one test item for each context type.
  var contexts = [
    "page",
    "selection",
    "link",
    "editable",
    "image",
    "video",
    "audio",
  ];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Test '" + context + "' menu item";
    var id = chrome.contextMenus.create({
      title: title,
      contexts: [context],
      id: "context" + context,
    });
    console.log("'" + context + "' item:" + id);
  }

  // Create a parent item and two children.
  chrome.contextMenus.create({ title: "Test parent item", id: "parent" });
  chrome.contextMenus.create({
    title: "Child 1",
    parentId: "parent",
    id: "child1",
  });
  chrome.contextMenus.create({
    title: "Child 2",
    parentId: "parent",
    id: "child2",
  });
  console.log("parent child1 child2");

  // Create some radio items.
  chrome.contextMenus.create({ title: "Radio 1", type: "radio", id: "radio1" });
  chrome.contextMenus.create({ title: "Radio 2", type: "radio", id: "radio2" });
  console.log("radio1 radio2");

  // Create some checkbox items.
  chrome.contextMenus.create({
    title: "Checkbox1",
    type: "checkbox",
    id: "checkbox1",
  });
  chrome.contextMenus.create({
    title: "Checkbox2",
    type: "checkbox",
    id: "checkbox2",
  });
  console.log("checkbox1 checkbox2");

  // Intentionally create an invalid item, to show off error checking in the
  // create callback.
  console.log(
    "About to try creating an invalid item - an error about " +
      "duplicate item child1 should show up"
  );

  chrome.contextMenus.create({ title: "Log Tabs", id: "log-tab" });
  chrome.contextMenus.create({ title: "Log Extensions", id: "log-ext" });
  chrome.contextMenus.create({ title: "Open all URLs", id: "open-all" });

  chrome.contextMenus.create({ title: "Oops", id: "error1" }, function () {
    if (chrome.extension.lastError) {
      console.log("Got expected error: " + chrome.extension.lastError.message);
    }
  });
});

//
function openAllUrls() {
  urls = Array.from(document.getElementsByTagName("a")).map((url) => url.href);
  urls.forEach((url) => {
    window.open(url);
  });
}
