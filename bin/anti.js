#!/usr/bin/env node

const { spawn, execSync } = require("child_process");
const os = require("os");
const { select, input } = require("@inquirer/prompts");

// Try to get from environment variable
let antigravityPath = process.env.ANTIGRAVITY_PATH;

function launch(executablePath) {
  // Get arguments passed to 'anti' (e.g., '.' for the current directory)
  const args = process.argv.slice(2);

  // We ensure the path is quoted if it has spaces
  const commandPath = executablePath.startsWith('"') ? executablePath : `"${executablePath}"`;

  // To avoid the Node.js DEP0190 deprecation warning when using shell: true,
  // we must pass a single string command instead of an array of arguments.
  const escapedArgs = args.map(arg => `"${arg.replace(/"/g, '\\"')}"`);
  const fullCommand = `${commandPath} ${escapedArgs.join(' ')}`;

  // Launch Antigravity with the provided arguments
  const anti = spawn(fullCommand, {
    shell: true,
    stdio: "inherit",
    detached: true,
  });

  anti.on("error", (err) => {
    console.error(`Failed to start Antigravity: ${err.message}`);
  });

  // Allow the process to exit independently of the child
  anti.unref();
}

async function findExecutables() {
  const platform = os.platform();
  let paths = [];

  try {
    if (platform === "win32") {
      // Find paths using where.exe
      const output = execSync("where.exe antigravity", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      paths = output.split("\n").map(p => p.trim()).filter(p => p);
    } else {
      // Find paths using which
      const output = execSync("which antigravity", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
      paths = output.split("\n").map(p => p.trim()).filter(p => p);
    }
  } catch (err) {
    // Command fails if not found, we just ignore
  }

  // Add the known shortcut on Windows just in case
  if (platform === "win32") {
    const defaultShortcut = `C:\\Users\\${os.userInfo().username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Antigravity\\Antigravity.lnk`;
    if (!paths.includes(defaultShortcut)) {
      paths.push(defaultShortcut);
    }
  }

  return paths;
}

function savePath(selectedPath) {
  const platform = os.platform();
  const cleanPath = selectedPath.replace(/^"|"$/g, '');
  try {
    if (platform === "win32") {
      execSync(`setx ANTIGRAVITY_PATH "${cleanPath}"`, { stdio: 'ignore' });
      console.log("Path saved permanently to system variables (ANTIGRAVITY_PATH).");
    } else {
      console.log(`\nTo save permanently on this OS, please add this to your profile (e.g. ~/.bashrc):`);
      console.log(`export ANTIGRAVITY_PATH="${cleanPath}"\n`);
    }
  } catch (err) {
    console.error("Failed to save path:", err.message);
  }
  return cleanPath;
}

async function run() {
  if (antigravityPath) {
    launch(antigravityPath);
    return;
  }

  const paths = await findExecutables();
  const MANUAL_OPTION = "manual_entry_option";
  let chosenPath = "";

  if (paths.length > 0) {
    const choices = paths.map(p => ({ name: p, value: p }));
    choices.push({ name: "None of the above - Enter manually", value: MANUAL_OPTION });

    chosenPath = await select({
      message: "Antigravity was found in these locations. Please select the correct one:",
      choices: choices
    });
  } else {
    console.log("Antigravity could not be found automatically in your PATH.");
    chosenPath = MANUAL_OPTION;
  }

  if (chosenPath === MANUAL_OPTION) {
    chosenPath = await input({
      message: "Please enter the full path to the Antigravity executable or shortcut:",
      validate: (val) => val.trim().length > 0 || "Path cannot be empty"
    });
  }

  if (chosenPath) {
    const cleanPath = savePath(chosenPath);
    console.log("Note: You may need to restart your terminal for the variable to apply in new runs.");
    launch(cleanPath);
  }
}

run().catch(console.error);
