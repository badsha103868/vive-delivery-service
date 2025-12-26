# Commit Guide (quick)

1) Inspect pending changes:
   git status
   git diff       # see unstaged changes
   git diff --cached # see staged changes

2) Auto-commit grouped changes (safe):
   npm run git:auto-commit
   # to push after committing:
   npm run git:auto-commit -- --push

3) Manual commit (recommended if you prefer granular control):
   git add .
   git commit -m "your message"
   git push -u origin main

4) Important:
   - Do NOT commit .env files or secrets.
   - Check `.gitignore` before committing.

If you want, I can propose exact commit messages for each change; run the auto-commit or follow the manual steps above.
