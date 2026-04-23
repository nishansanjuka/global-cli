# Global CLI

![NPM License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

A professional collection of global CLI tools designed to enhance local development environments. Built by [Nipuna Nishan](https://nishansanjuka.me).

## Overview

This package provides a suite of globally accessible commands that automate repetitive developer tasks, such as launching Antigravity with smart environment detection, or running Drizzle Studio without manual configuration overhead.

## Installation

To install these tools globally on your machine, run:

```bash
npm install -g @nishansanjuka/global-cli
```

## Commands

### 1. `anti` - The Antigravity Launcher
A smart, OS-aware launcher for the Antigravity executable.
* **Auto-Discovery**: Automatically searches your `PATH` (using `where` on Windows and `which` on Mac/Linux) to find installed instances.
* **Interactive Setup**: Uses an arrow-key interface to let you select the correct path if multiple instances are found.
* **Persistent**: Permanently saves your selection to the `ANTIGRAVITY_PATH` environment variable so it only asks you once.

**Usage:**
```bash
anti
# or with arguments:
anti .
```

### 2. `dzstudio` - Drizzle Studio Wrapper
A convenient wrapper around `drizzle-kit studio` that removes the need for manual configuration files.
* **Dynamic Configuration**: Automatically generates a temporary `drizzle.studio.config.js` with your provided database URL.
* **Interactive Input**: If you don't pass a URL, it prompts you interactively.
* **Auto-Cleanup**: Cleans up the temporary config file when you exit the studio.

**Usage:**
```bash
# Pass the URL directly
dzstudio postgres://user:pass@localhost:5432/dbname

# Or run it and wait for the interactive prompt
dzstudio
```

### 3. `gcli`
A simple test command to verify your global installation is active.

**Usage:**
```bash
gcli
# Output: "Global CLI is active!"
```

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**. 

### Why GPL-3.0?
This is a strict open-source license. It means:
* ✅ You are free to use, fork, modify, and distribute this software.
* ⚠️ **However**, any modified versions or derivative works that you distribute **must also be open-sourced** under the exact same GPL-3.0 license.
* ❌ You cannot take this code, modify it, and distribute it as closed-source proprietary software.

For the full license text, please see the [LICENSE](LICENSE) file.

---
*Developed with ❤️ by [Nipuna Nishan](https://nishansanjuka.me).*
