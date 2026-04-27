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

const B = '\x1b[38;2;69;162;248m'; // Blue
const P = '\x1b[38;2;147;118;224m'; // Purple
const K = '\x1b[38;2;216;112;147m'; // Pink
const reset = '\x1b[0m';

const logoBlock = `
${B}██${reset}
${B}██${P}██${reset}
  ${P}██${reset}
  ${P}██${K}██${reset}   \x1b[1m${B}G\x1b[38;2;147;118;224ml\x1b[38;2;216;112;147mo\x1b[38;2;69;162;248mb\x1b[38;2;147;118;224ma\x1b[38;2;216;112;147ml\x1b[0m \x1b[1m${B}C\x1b[38;2;147;118;224mL\x1b[38;2;216;112;147mI\x1b[0m \x1b[90mby\x1b[0m \x1b[1m${B}N\x1b[38;2;147;118;224mi\x1b[38;2;216;112;147mp\x1b[38;2;69;162;248mu\x1b[38;2;147;118;224mn\x1b[38;2;216;112;147ma\x1b[0m \x1b[1m${B}N\x1b[38;2;147;118;224mi\x1b[38;2;216;112;147ms\x1b[38;2;69;162;248mh\x1b[38;2;147;118;224ma\x1b[38;2;216;112;147mn\x1b[0m
  ${P}██${reset}
${B}██${P}██${reset}
${B}██${reset}
`;

const banner = `
 ████   ██        ████   ████      ██    ██         ████   ██       ██      
██      ██       ██  ██  ██  ██  ██  ██  ██        ██      ██       ██          
██  ███ ██       ██  ██  ████    ██████  ██        ██      ██       ██        
██   ██ ██       ██  ██  ██  ██  ██  ██  ██        ██      ██       ██         
 ████   ███████   ████   ████    ██  ██  ███████    ████   ███████  ██     ${reset}  
`;

const helpMessage = `
${banner}

${logoBlock}
--------------------------------------------------
A professional collection of global CLI tools to enhance local development environments.

\x1b[1mAvailable Commands:\x1b[0m

  \x1b[32manti\x1b[0m        A smart, OS-aware launcher for the Antigravity executable with interactive setup.
              \x1b[90mUsage: anti [args]\x1b[0m

  \x1b[32mdzstudio\x1b[0m    A convenient wrapper around drizzle-kit studio. No manual configuration needed!
              \x1b[90mUsage: dzstudio [database_url]\x1b[0m

  \x1b[32mastudio\x1b[0m     A smart, OS-aware launcher for Android Studio with interactive setup.
              \x1b[90mUsage: astudio [args]\x1b[0m

  \x1b[32mgcli\x1b[0m        Prints this help message.

`;

console.log(helpMessage);
