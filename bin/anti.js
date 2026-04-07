#!/usr/bin/env node

const { spawn } = require("child_process");

// Path to the Antigravity executable
const antigravityPath = `"C:\\Users\\Nishan\\AppData\\Local\\Programs\\Antigravity\\Antigravity.exe"`;

// Get arguments passed to 'anti' (e.g., '.' for the current directory)
const args = process.argv.slice(2);

// Launch Antigravity with the provided arguments
const anti = spawn(antigravityPath, args, {
  shell: true,
  stdio: "inherit",
  detached: true,
});

anti.on("error", (err) => {
  console.error(`Failed to start Antigravity: ${err.message}`);
});

// Allow the process to exit independently of the child
anti.unref();
