## Use extension's resources
- matches : <all_pages>
- Opt 1:
    - content_scripts: \"js\": ["./js/lib/beautify.js","./js/content.js"],

* Opt 2:
    - Append element in content.js: src=chrome.extension.getURL("js/lib/beautify.js")

* Note:
    - not use '.', use full path

![alt](./icon/icons8-v-live-128-color.png)

