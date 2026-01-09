---
description: Restart Electron App
---
1. Kill any existing node/electron processes to ensure a clean slate.
2. Start the application again.
// turbo-all
3. Send CTRL+C to terminal named "powershell" if it exists.
4. Run `taskkill /F /IM electron.exe` in a new terminal to force kill any lingering processes.
5. Run `taskkill /F /IM node.exe` in a new terminal to force kill any lingering processes.
6. Run `npm run electron:dev` in terminal "powershell"
