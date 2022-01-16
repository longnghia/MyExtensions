#!/bin/bash
## !/bin/sh  #sh fail on sed

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
echo "dir = $DIR"
if [ "$(uname -s)" = "Darwin" ]; then #mac
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else # linux
  if [ "$(whoami)" = "root" ]; then #root
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.ln.chrome.script.editor

# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/script-editor-host
echo HOST_PATH=$HOST_PATH

# ESCAPED_HOST_PATH=${HOST_PATH////\\/}
ESCAPED_HOST_PATH=${HOST_PATH//\//\\\/}
echo ESCAPED_HOST_PATH=$ESCAPED_HOST_PATH

sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"


# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"

echo "Native messaging host $HOST_NAME has been installed."
