# Open selected
![icon](./icon/icons8-open-100-color.png)
## Description
An extension to open selected link in background or foreground


## Usage
- **ctr q**: open in background
- **ctr shift q**: open in newtab

## How it works?
1. background receives user shortcut command
2. backgound send message to active tab
3. content.js receive message, get selected text, send it back to bg.js
4. bg.js receives msg from content.js, open link in msg.