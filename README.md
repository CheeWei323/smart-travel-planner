# TravelWise Smart Travel Planner

TravelWise is our Web API assignment project. It uses React and Vite for the website, Express and Node.js for the API, and MongoDB for data storage.

The system has two separate portals:

- **Traveler portal:** trips, itineraries, budgets, favorites, checklists, profile and feedback.
- **Admin portal:** dashboard, user management, trip management, announcements, feedback management and administrator settings. Admins do not use personal travel features.

Additional features and security improvements are planned for a separate assignment phase.

## Set up on a teammate's computer

### 1 Install the required software

Install **Git** and **Node.js 22 LTS**, using version **22.12 or newer**. npm comes with Node.js. This project was checked using Node.js 22.16.

Check the installation in Command Prompt, PowerShell or the VS Code terminal:

```bash
git --version
node --version
npm --version
```

We use **MongoDB Atlas** for the shared development database. You do not need to install MongoDB locally when using Atlas.

### 2 Download the project

After the team lead pushes the updated branch, run:

```bash
git clone https://github.com/CheeWei323/smart-travel-planner.git
cd smart-travel-planner
git switch feature/admin-portal-and-security-plan
```

If the project is already downloaded, open its folder in the terminal and run:

```bash
git fetch origin
git switch feature/admin-portal-and-security-plan
git pull --ff-only
```

Save or commit your own work before switching branches. If the team later merges this branch into `main`, use `main` instead.

### 3 Install the project packages

Run this from the **main project folder**, where the root `package.json` is located:

```bash
npm run setup
```

This installs the root, backend and frontend packages. The first installation may take a few minutes because the testing package can download a local MongoDB executable.

### 4 Add the environment file

Get the development `.env` file directly from the team lead through a private channel. Place it here:

```text
smart-travel-planner/
  backend/
    .env
    .env.example
    server.js
```

The filename must be exactly **`.env`**. Do not put the values only in `.env.example`, and check that Windows has not saved it as `.env.txt`.

Private sharing with trusted teammates is acceptable for our development setup. The file grants database/API access, so keep it within the team and out of GitHub, screenshots and public chats. Use development credentials rather than production credentials. The repository already ignores `.env`.

If no shared file is available, make a copy of `backend/.env.example` named `backend/.env` and fill in your own settings. Do not overwrite an existing `.env` that is already configured.

### 5 Allow the teammate's database connection

The Atlas project owner must add the teammate's current public IP under **Network Access / IP Access List**. Sharing `.env` alone does not grant network access to Atlas. Add the individual teammate IP instead of opening the database to everyone. See [MongoDB's IP access instructions](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

All teammates using the same connection string are working with the same development data. Coordinate before deleting shared records.

### 6 Start the system

From the main project folder, run:

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in the browser.

| Service | Address |
| --- | --- |
| Website | http://localhost:5173 |
| API | http://localhost:5000 |
| Database health check | http://localhost:5000/api/health |

Keep the terminal open while using the system. Press **Ctrl+C** to stop it. If Windows PowerShell blocks `npm.ps1`, use Command Prompt or run `npm.cmd run dev`.

### 7 Log in with the correct account

**Travelers:** register on the website, then log in. New registrations receive the normal user role.

**Administrators:** log in with an existing administrator account. The website opens [the admin portal](http://localhost:5173/admin) automatically. Use a separate named account for each teammate where practical, so administrative actions can be attributed to a person.

If using our existing shared database, an administrator already exists. You do **not** need to run the admin setup command again. Ask the team lead for access, or have an existing administrator change your registered account's role from **Admin portal → Users → Make admin**.

If your role changes while you are logged in, log out and log in again.

## Create an administrator for a new database

This is only needed when setting up a fresh database without an administrator.

1. Open **`backend/.env`**, not `.env.example`.
2. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_USERNAME` to your intended account details. Use an email that is not already registered as a normal user.
3. Run this from the main project folder:

```bash
npm run seed:admin
```

4. Wait for **Administrator created. You can now log in.**
5. Start the system and log in using those details.

If the administrator already exists, the command leaves its password and status unchanged. If the email belongs to a normal user, it refuses to promote that account automatically; use an existing administrator's Users page or choose a new email for initial setup.

## Environment settings

Teammates who receive the configured development `.env` usually do not need to change these values.

| Setting | What it is used for |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas database connection. Required. |
| `JWT_SECRET` | Private authentication signing secret. Required. |
| `PORT` | Backend port. Keep `5000` for normal local setup. |
| `FRONTEND_URL` | Allowed website address. Use `http://localhost:5173`. |
| `APP_TIMEZONE` | Admin statistics time zone. Use `Asia/Kuala_Lumpur`. |
| `WEATHER_API_KEY` | Optional OpenWeatherMap key for current weather. |
| `PEXELS_API_KEY` | Optional Pexels key for destination photos. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_USERNAME` | Used by the initial admin setup command. |

Existing backend variables named `VITE_WEATHER_API_KEY` and `VITE_PEXELS_API_KEY` still work for compatibility. Prefer the names above. Private provider keys belong in the backend, not frontend code.

Trips can still be planned without weather/photo keys. Location-search outages also allow manual destination entry and manual itinerary coordinates. The weather display shows **current conditions**, not a forecast for arbitrary future travel dates.

Normal local development needs no `frontend/.env`. The frontend uses a proxy to port `5000`. Only for separate hosting, set `VITE_API_URL` in `frontend/.env`, using the API address ending in `/api`.

If you choose local MongoDB instead of Atlas, it must be configured as a **replica set**. Trip/checklist saves and related-data deletion use transactions and do not work on a standalone MongoDB server.

## Useful commands

Run these from the main project folder:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend together. |
| `npm run frontend` | Start only the frontend. |
| `npm run backend` | Start only the backend. |
| `npm run seed:admin` | Create the initial administrator. |
| `npm test` | Run isolated API and frontend utility tests. |
| `npm run lint --prefix frontend` | Check frontend code. |
| `npm run build` | Create the production frontend in `frontend/dist`. |
| `npm run check` | Run tests and the production build. |

The automated API tests use their own temporary database and do not load our shared `.env` or use our real Atlas database. Their first run may need to download MongoDB.

For a disposable demo without our shared database, run `npm run dev:demo --prefix backend` in one terminal and `npm run frontend` in another. Stop the normal API first so port `5000` is available. Demo logins are `traveler@example.test` and `admin@example.test`, both with the demo-only password `DemoTravel123!`. Demo data is temporary; these accounts are not created by the real server.

## Common setup problems

| Problem | What to check |
| --- | --- |
| `Email must contain 1–254 characters` during admin setup | Admin variables are missing from `backend/.env`. Values in `.env.example` alone are not loaded. |
| `This email belongs to an ordinary account` | Use a new email for initial setup, or ask an existing admin to change the account's role. |
| Cannot connect to MongoDB | Confirm `MONGO_URI`, database credentials and the teammate's current Atlas IP access entry. |
| `JWT_SECRET` or `MONGO_URI` is missing | Check the file is `backend/.env`, then restart the API. |
| Port `5000` or `5173` is already in use | Stop the older project terminal with Ctrl+C, then start one copy of the system. |
| Weather/photos do not load | Check optional keys and provider availability. Other planning features still work. |
| Admin still sees the old interface | Refresh the browser. Log out/in if the account role recently changed. |
| Personal travel pages redirect to `/admin` | The logged-in account is an administrator. Use a normal user account for personal travel planning. |
| Test download fails | Check internet access and retry `npm test`. This does not require changing our real database. |

## Save the completed work on a new branch

The commands below save the current completed system, separate admin portal and setup guide. Future security-assignment work will be implemented separately.

```bash
git switch -c feature/admin-portal-and-security-plan
git status
git check-ignore backend/.env
git add .
git diff --cached --stat
git commit -m "feat: complete travel planner and separate admin portal"
git push -u origin feature/admin-portal-and-security-plan
```

`git check-ignore backend/.env` should print `backend/.env`. Before committing, confirm the staged files do not include the real `.env`. The example files `.env.example` are intended to be committed.

After pushing, share the branch name with teammates. Share the private environment file separately.
