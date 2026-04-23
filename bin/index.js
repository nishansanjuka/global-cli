#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the version from package.json dynamically
let version = '1.0.0';
try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version;
} catch (err) {
    // Ignore if package.json can't be read
}

const helpMessage = `
\x1b[1m\x1b[36mGlobal CLI (@nishansanjuka/global-cli) v${version}\x1b[0m
--------------------------------------------------
A professional collection of global CLI tools to enhance local development environments.

\x1b[1mAvailable Commands:\x1b[0m

  \x1b[32manti\x1b[0m        A smart, OS-aware launcher for the Antigravity executable with interactive setup.
              \x1b[90mUsage: anti [args]\x1b[0m

  \x1b[32mdzstudio\x1b[0m    A convenient wrapper around drizzle-kit studio. No manual configuration needed!
              \x1b[90mUsage: dzstudio [database_url]\x1b[0m

  \x1b[32mgcli\x1b[0m        Prints this help message.

`;

console.log(helpMessage);
