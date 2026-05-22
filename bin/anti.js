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
      // Find paths using where.exe for both names
      const commands = [
        'where.exe "antigravity"',
        'where.exe "Antigravity IDE.exe"',
      ];
      for (const cmd of commands) {
        try {
          const output = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] });
          paths = paths.concat(output.split("\n").map(p => p.trim()).filter(p => p));
        } catch (e) {
          // where.exe fails if not found, ignore
        }
      }
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
    const username = os.userInfo().username;
    const defaultShortcuts = [
      `C:\\Users\\${username}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Antigravity\\Antigravity.lnk`,
      `C:\\Users\\${username}\\AppData\\Local\\Programs\\Antigravity IDE\\Antigravity IDE.exe`
    ];
    for (const shortcut of defaultShortcuts) {
      if (!paths.includes(shortcut)) {
        paths.push(shortcut);
      }
    }
  }

  return [...new Set(paths)]; // Return unique paths
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

function clearSavedPath() {
  const platform = os.platform();
  if (platform === "win32") {
    try {
      // The command to delete an environment variable can be tricky.
      // A common way is to set it to an empty value, but that might not fully remove it.
      // Using 'reg delete' is more reliable but can be dangerous if not used carefully.
      // We'll try setting it to empty first as it's safer.
      execSync(`setx ANTIGRAVITY_PATH ""`, { stdio: 'ignore' });
      console.log("Cleared saved ANTIGRAVITY_PATH. You may need to restart your terminal.");
    } catch (err) {
      // If setx fails, it might be because the variable doesn't exist, which is fine.
      // If it's another error, we should probably let the user know.
      if (!err.message.includes("not found")) {
        console.error("Failed to clear saved path. You may need to remove the ANTIGRAVITY_PATH environment variable manually.", err.message);
      }
    }
  } else {
    console.log(`\nTo reset on this OS, please remove this from your profile (e.g. ~/.bashrc):`);
    console.log(`export ANTIGRAVITY_PATH="..."\n`);
  }
}

async function run() {
  const reconfigure = process.argv.includes('--config') || process.argv.includes('-c');

  if (reconfigure) {
    console.log("Re-configuration requested.");
    clearSavedPath();
    antigravityPath = null; // Force re-evaluation
  }

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

run().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nCancelled.');
    process.exit(0);
  } else {
    console.error(err);
    process.exit(1);
  }
});
