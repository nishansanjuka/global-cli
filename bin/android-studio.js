#!/usr/bin/env node

const { spawn, execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const { select, input } = require("@inquirer/prompts");

// Try to get from environment variable
let androidStudioPath = process.env.ANDROID_STUDIO_PATH;

function launch(executablePath) {
  // Get arguments passed to the command (e.g., '.' for the current directory)
  const args = process.argv.slice(2);

  // We ensure the path is quoted if it has spaces
  const commandPath = executablePath.startsWith('"') ? executablePath : `"${executablePath}"`;

  // For Android Studio, we just pass arguments through. 
  // We quote each argument individually to handle spaces, but we don't wrap the whole thing in another layer.
  const escapedArgs = args.map(arg => {
    // If the argument is already quoted, don't double quote it
    if (arg.startsWith('"') && arg.endsWith('"')) return arg;
    return `"${arg}"`;
  });
  const fullCommand = `${commandPath} ${escapedArgs.join(' ')}`;

  // Launch Android Studio with the provided arguments
  const studio = spawn(fullCommand, {
    shell: true,
    stdio: "inherit",
    detached: true,
  });

  studio.on("error", (err) => {
    console.error(`Failed to start Android Studio: ${err.message}`);
  });

  // Allow the process to exit independently of the child
  studio.unref();
}

async function findExecutables() {
  const platform = os.platform();
  let paths = [];

  try {
    if (platform === "win32") {
      // Find paths using where.exe for studio64.exe
      const output = execSync("where.exe studio64.exe", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      paths = output.split("\n").map(p => p.trim()).filter(p => p);
    } else if (platform === "darwin") {
      // Find on Mac
      paths.push("/Applications/Android Studio.app/Contents/MacOS/studio");
    } else {
      // Find paths using which
      const output = execSync("which studio", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      paths = output.split("\n").map(p => p.trim()).filter(p => p);
    }
  } catch (err) {
    // Command fails if not found, we just ignore
  }

  // Add the known shortcuts and default paths on Windows just in case
  if (platform === "win32") {
    const allUsersShortcut = `C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Android Studio\\Android Studio.lnk`;
    const currentUserShortcut = `C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Android Studio\\Android Studio.lnk`;
    const defaultExe = "C:\\Program Files\\Android\\Android Studio\\bin\\studio64.exe";
    
    if (!paths.includes(allUsersShortcut)) {
      paths.push(allUsersShortcut);
    }
    if (!paths.includes(currentUserShortcut)) {
      paths.push(currentUserShortcut);
    }
    if (!paths.includes(defaultExe)) {
      paths.push(defaultExe);
    }
  }

  // Only return paths that actually exist to provide a better user experience
  return paths.filter(p => {
    try {
      return fs.existsSync(p);
    } catch (e) {
      return false;
    }
  });
}

function savePath(selectedPath) {
  const platform = os.platform();
  const cleanPath = selectedPath.replace(/^"|"$/g, '');
  try {
    if (platform === "win32") {
      execSync(`setx ANDROID_STUDIO_PATH "${cleanPath}"`, { stdio: 'ignore' });
      console.log("Path saved permanently to system variables (ANDROID_STUDIO_PATH).");
    } else {
      console.log(`\nTo save permanently on this OS, please add this to your profile (e.g. ~/.bashrc or ~/.zshrc):`);
      console.log(`export ANDROID_STUDIO_PATH="${cleanPath}"\n`);
    }
  } catch (err) {
    console.error("Failed to save path:", err.message);
  }
  return cleanPath;
}

async function run() {
  if (androidStudioPath) {
    launch(androidStudioPath);
    return;
  }

  const paths = await findExecutables();
  const MANUAL_OPTION = "manual_entry_option";
  let chosenPath = "";

  if (paths.length > 0) {
    const choices = paths.map(p => ({ name: p, value: p }));
    choices.push({ name: "None of the above - Enter manually", value: MANUAL_OPTION });

    chosenPath = await select({
      message: "Android Studio was found in these locations. Please select the correct one:",
      choices: choices
    });
  } else {
    console.log("Android Studio could not be found automatically in your PATH or standard locations.");
    chosenPath = MANUAL_OPTION;
  }

  if (chosenPath === MANUAL_OPTION) {
    chosenPath = await input({
      message: "Please enter the full path to the Android Studio executable or shortcut:",
      validate: (val) => val.trim().length > 0 || "Path cannot be empty"
    });
  }

  if (chosenPath) {
    const cleanPath = savePath(chosenPath);
    console.log("Note: You may need to restart your terminal for the variable to apply in new runs.");
    launch(cleanPath);
  }
}

run().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nCancelled.');
    process.exit(0);
  } else {
    console.error(err);
    process.exit(1);
  }
});
