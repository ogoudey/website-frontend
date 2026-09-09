#!/bin/bash

VENV_PATH="/home/protected/olimn/.venv"
REQ_FILE="/home/protected/olimn/requirements.txt"
MAIN_SCRIPT="/home/protected/olimn/main.py"

# Upgrade pip and install/update dependencies using the venv's pip
"$VENV_PATH/bin/pip" install --upgrade pip
if [ -f "$REQ_FILE" ]; then
    "$VENV_PATH/bin/pip" install -r "$REQ_FILE" --upgrade
fi

# Execute the main script
exec "$VENV_PATH/bin/python" "$MAIN_SCRIPT"