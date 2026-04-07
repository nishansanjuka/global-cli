#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Why: Facilitate database connection via CLI arguments or interactive prompts for Drizzle Studio
async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  let dbUrl = process.argv[2];

  // Why: Interactive fallback for ease of use
  if (!dbUrl) {
    dbUrl = await askQuestion('PostgreSQL Database URL: ');
  }

  if (!dbUrl) {
    console.error('Error: Database URL is required.');
    process.exit(1);
  }

  // Why: Drizzle Studio requires a configuration file; we generate a temporary one
  const tempId = crypto.randomBytes(4).toString('hex');
  const configFileName = `drizzle.studio.${tempId}.config.js`;
  const configPath = path.join(process.cwd(), configFileName);

  const configContent = `
module.exports = {
  dialect: "postgresql",
  dbCredentials: {
    url: "${dbUrl}",
  },
};
`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log(`Starting Drizzle Studio with URL...`);

    // Why: Use local drizzle-kit binary from the project to ensure dependencies (drizzle-orm, pg) are always available
    const kitPath = path.resolve(__dirname, '../node_modules/.bin/drizzle-kit');
    
    if (!fs.existsSync(kitPath) && !fs.existsSync(kitPath + '.cmd')) {
      console.error(`Error: drizzle-kit binary not found at ${kitPath}. Try running 'npm install' in the project folder.`);
      cleanup();
      process.exit(1);
    }

    const studio = spawn(kitPath, ['studio', '--config', configFileName], {
      stdio: 'inherit',
      shell: true
    });

    // Why: Cleanup temporary config file when the process exits
    const cleanup = () => {
      if (fs.existsSync(configPath)) {
        try {
          fs.unlinkSync(configPath);
        } catch (e) {}
      }
    };

    studio.on('exit', () => cleanup());
    process.on('SIGINT', () => {
      cleanup();
      process.exit();
    });
    process.on('SIGTERM', () => {
      cleanup();
      process.exit();
    });

  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
    process.exit(1);
  }
}

main();
