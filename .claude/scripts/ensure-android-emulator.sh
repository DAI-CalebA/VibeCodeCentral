#!/bin/bash
# Reads a Bash tool stdin payload and starts the Android emulator if needed
# before any command that targets Android.

ADB="/c/Users/small/AppData/Local/Android/Sdk/platform-tools/adb"
EMULATOR="/c/Users/small/AppData/Local/Android/Sdk/emulator/emulator"
AVD="Medium_Phone"

CMD=$(node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{process.stdout.write(JSON.parse(d).tool_input.command||'')}catch(e){}})")

# Only act on android-related commands
if ! echo "$CMD" | grep -qE '(android|expo start.*--android)'; then
  exit 0
fi

# Check for a connected/running device
DEVICES=$("$ADB" devices 2>/dev/null | grep -v "List of devices" | grep -v "^[[:space:]]*$" | grep "device$")

if [ -n "$DEVICES" ]; then
  exit 0
fi

echo "No Android device detected. Starting emulator '$AVD'..." >&2
"$EMULATOR" -avd "$AVD" -no-snapshot-load > /dev/null 2>&1 &

echo "Waiting for device to come online..." >&2
"$ADB" wait-for-device > /dev/null 2>&1

# Poll until boot is complete
BOOT=""
TRIES=0
while [ "$BOOT" != "1" ] && [ "$TRIES" -lt 30 ]; do
  sleep 3
  BOOT=$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r\n')
  TRIES=$((TRIES + 1))
done

if [ "$BOOT" = "1" ]; then
  echo "Emulator ready." >&2
else
  echo "Warning: emulator may still be booting." >&2
fi
