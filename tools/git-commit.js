#!/usr/bin/env node
const { execSync, spawnSync } = require('child_process');
const args = process.argv.slice(2);

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: opts.stdio || 'pipe' }).toString().trim();
  } catch (err) {
    throw err;
  }
}

function help() {
  console.log(`
Usage:
  node tools/git-commit.js --init [--repo <url>]   Initialize git, initial commit and optionally add remote and push
  node tools/git-commit.js "commit message" [--push] [--remote <name>] [--branch <name>]

Examples:
  npm run git:init -- --repo https://github.com/you/repo.git
  npm run git:commit -- "feat: add new page"
  npm run git:commit -- "fix: bug" -- --push
`);
}

async function main() {
  if (args.length === 0) { help(); return; }

  try {
    // parse flags
    const isInit = args.includes('--init');
    const push = args.includes('--push');
    const repoIndex = args.indexOf('--repo');
    const repo = repoIndex >= 0 ? args[repoIndex + 1] : null;
    const remoteIndex = args.indexOf('--remote');
    const remote = remoteIndex >= 0 ? args[remoteIndex + 1] : 'origin';
    const branchIndex = args.indexOf('--branch');
    const branch = branchIndex >= 0 ? args[branchIndex + 1] : 'main';

    if (isInit) {
      console.log('Initializing git repository...');
      run('git init');
      run('git add -A');
      run(`git commit -m "chore: initial commit" || true`);
      run(`git branch -M ${branch} || true`);
      if (repo) {
        run(`git remote add ${remote} ${repo}`);
        run(`git push -u ${remote} ${branch}`);
        console.log('Pushed initial commit to', repo);
      } else {
        console.log('No remote provided. Repo initialized locally.');
      }
      return;
    }

    // commit flow
    // extract commit message (first non-flag arg)
    const flags = new Set(['--push','--remote','--branch']);
    let message = null;
    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('--')) {
        message = args[i];
        break;
      }
    }
    if (!message) {
      console.error('No commit message provided.');
      help();
      process.exit(1);
    }

    // stage, commit
    console.log('Staging changes...');
    run('git add -A');
    console.log('Committing...');
    try {
      run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
      console.log('Committed:', message);
    } catch (err) {
      const out = (err.stdout || '').toString();
      if (/nothing to commit/.test(err.message || out)) {
        console.log('Nothing to commit.');
      } else {
        throw err;
      }
    }

    if (push) {
      console.log(`Pushing to ${remote}/${branch}...`);
      run(`git push ${remote} ${branch}`);
      console.log('Pushed.');
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
