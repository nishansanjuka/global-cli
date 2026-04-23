#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { select, input } = require('@inquirer/prompts');

async function main() {
  const allArgs = process.argv.slice(2);
  const dbUrlArg = allArgs.find(arg => !arg.startsWith('--'));
  const passThroughArgs = allArgs.filter(arg => arg !== dbUrlArg);

  let finalUrl = dbUrlArg;
  let dialect = "postgresql";

  // Why: Interactive input if no URL argument is provided, infer if provided
  if (finalUrl) {
    if (finalUrl.startsWith('mysql://')) {
      dialect = 'mysql';
    } else if (finalUrl.startsWith('sqlite://') || finalUrl.endsWith('.db') || finalUrl.endsWith('.sqlite')) {
      dialect = 'sqlite';
    } else {
      dialect = 'postgresql'; // Default assumption
    }
  } else {
    dialect = await select({
      message: 'Select database dialect:',
      choices: [
        { name: 'PostgreSQL', value: 'postgresql' },
        { name: 'MySQL', value: 'mysql' },
        { name: 'SQLite', value: 'sqlite' },
      ],
    });

    finalUrl = await input({
      message: `Enter ${dialect === 'sqlite' ? 'database path (e.g., sqlite.db)' : dialect + ' database URL'}: `,
      validate: (val) => val.trim().length > 0 || "URL/Path cannot be empty"
    });
  }

  // Why: Drizzle Studio requires a configuration file; using a unique name to avoid overwriting project files
  const tempId = crypto.randomBytes(4).toString('hex');
  const configFileName = `drizzle.studio.${tempId}.config.js`;
  const configPath = path.join(process.cwd(), configFileName);

  const configContent = `
module.exports = {
  dialect: "${dialect}",
  dbCredentials: {
    url: "${finalUrl}",
  },
};
`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log(`Starting Drizzle Studio with ${dialect}...`);

    // Why: Use local drizzle-kit binary from the project to ensure dependencies (drizzle-orm, pg) are always available
    const kitPath = path.resolve(__dirname, '../node_modules/.bin/drizzle-kit');

    if (!fs.existsSync(kitPath) && !fs.existsSync(kitPath + '.cmd')) {
      console.error(`Error: drizzle-kit binary not found at ${kitPath}. Try running 'npm install' in the project folder.`);
      cleanup();
      process.exit(1);
    }

    const studio = spawn(kitPath, ['studio', '--config', configFileName, ...passThroughArgs], {
      stdio: 'inherit',
      shell: true
    });

    // Why: Cleanup temporary config file when the process exits
    const cleanup = () => {
      if (fs.existsSync(configPath)) {
        try {
          fs.unlinkSync(configPath);
        } catch (e) { }
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

main().catch((err) => {
  if (err.name === 'ExitPromptError') {
    console.log('\nCancelled.');
    process.exit(0);
  } else {
    console.error(err);
    process.exit(1);
  }
});
