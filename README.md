# Vive Delivery Service (monorepo)

This repo contains:
- client — React (Vite) frontend
- server — Node + Express backend (native MongoDB driver)

Quick start
1. Install client deps:
   cd client
   npm install
   npm run dev

2. Install server deps:
   cd server
   npm install
   copy .env.example to .env and set MONGO_URI
   npm run dev

Open the client at http://localhost:5173 (default).

## Running the project

1) Install deps
- Client:
  cd client
  npm install
- Server:
  cd server
  npm install

2) Run servers (two terminals)
- Start server:
  cd server
  npm run dev
- Start client:
  cd client
  npm run dev

3) Open in browser
- Client: http://localhost:5173
- Server health: http://localhost:4000/api/health

Optional: run both from repo root
- Install root dev tool:
  npm install
- Start both (single terminal):
  npm run dev

## Using MongoDB Atlas
1. In Atlas, create a project and a cluster.
2. Create a Database User (username/password).
3. In Network Access, add your IP address (or 0.0.0.0/0 for testing).
4. Copy the connection string (mongodb+srv://...) and set it in server/.env as MONGO_URI.
   - If password has special characters, URL-encode it.
   - Example:
     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcd123.mongodb.net/vive_delivery?retryWrites=true&w=majority
5. Restart server:
   cd server
   npm run dev
6. If connection fails, check server logs for hints about whitelist or authentication.

## Connect to GitHub

1. Create a new repository on GitHub (https://github.com/new). Copy the repo URL (HTTPS or SSH).
2. From the project root run (example using git directly):
   ```
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin <REPO_URL>
   git push -u origin main
   ```
3. Or use the helper script added to this repo:
   - Initialize and push initial commit:
     npm run git:init -- --repo <REPO_URL>
   - Commit staged changes:
     npm run git:commit -- "your commit message"
   - Commit and push:
     npm run git:commit -- "message" --push
4. If using HTTPS and push fails, create a personal access token (PAT) and use it or switch to SSH.

Troubleshooting
- If ports conflict, change PORT in server/.env
- If client doesn't show updates, restart `npm run dev` after installing new deps.
