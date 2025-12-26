#!/usr/bin/env node
const { execSync } = require('child_process');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}

const args = process.argv.slice(2);
const push = args.includes('--push');
const remote = (() => {
  const i = args.indexOf('--remote'); return i >= 0 ? args[i+1] : 'origin';
})();
const branch = (() => {
  const i = args.indexOf('--branch'); return i >= 0 ? args[i+1] : 'main';
})();

const groups = [
  { msg: 'chore: add project scaffold and docs', patterns: ['README.md','plan-prompts.md','package.json'] },
  { msg: 'feat(client): add banner slider, topbar and hero UI', patterns: ['client/src/components/BannerSlider.jsx','client/src/components/TopBar.jsx','client/src/pages/Home.jsx'] },
  { msg: 'fix(client): BannerSlider image + controls fixes', patterns: ['client/src/components/BannerSlider.jsx'] },
  { msg: 'feat(client): add testimonial carousel with avatars', patterns: ['client/src/components/TestimonialCarousel.jsx'] },
  { msg: 'feat(client): auth UI and context (login/register)', patterns: ['client/src/contexts/AuthContext.jsx','client/src/pages/Login.jsx','client/src/pages/Register.jsx','client/src/components/Navbar.jsx'] },
  { msg: 'feat(server): auth endpoints and /api/estimate and /api/parcels', patterns: ['server/index.js'] },
  { msg: 'feat(client): CreateParcel form and estimate/submit flow', patterns: ['client/src/pages/CreateParcel.jsx'] },
  { msg: 'chore: add logo asset and favicon', patterns: ['client/src/assets/logo.svg','client/index.html'] },
  { msg: 'chore: add sweetalert2 UI for auth flows', patterns: ['client/package.json','client/src/pages/Login.jsx','client/src/pages/Register.jsx','client/src/components/Navbar.jsx'] },
  { msg: 'chore: add git helper & commit guide', patterns: ['tools/git-commit.js','tools/auto-commit.js','COMMIT_GUIDE.md'] },
];

console.log('Auto-commit script running...');
for (const g of groups) {
  try {
    // stage patterns (shell will ignore non-existing globs)
    const pat = g.patterns.join(' ');
    run(`git add ${pat}`);
    const staged = run('git diff --cached --name-only');
    if (!staged) {
      console.log(`No changes staged for commit: "${g.msg}" (skipping)`);
      continue;
    }
    try {
      run(`git commit -m "${g.msg.replace(/"/g, '\\"')}" --no-verify`);
      console.log(`Committed: ${g.msg}`);
    } catch (err) {
      const out = (err.stdout || err.message || '').toString();
      if (/nothing to commit/i.test(out)) {
        console.log(`Nothing to commit for: ${g.msg}`);
      } else {
        console.error('Commit failed for:', g.msg, err.message || err);
      }
    }
  } catch (err) {
    console.warn(`Warning while processing group "${g.msg}":`, err.message || err);
  }
}

if (push) {
  try {
    console.log(`Pushing to ${remote}/${branch}...`);
    run(`git push ${remote} ${branch}`);
    console.log('Push complete.');
  } catch (err) {
    console.error('Push failed:', err.message || err);
  }
}

console.log('Auto-commit finished. Run git log --oneline to verify commits.');
