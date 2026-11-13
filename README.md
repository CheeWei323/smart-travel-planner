# TravelWise Smart Travel Planner

TravelWise is a travel planning system built with React, Vite, Express, Node.js and MongoDB.

- **Traveler portal:** trips, itineraries, budgets, favorites, checklists, account settings and feedback.
- **Admin portal:** dashboard, users, trip management, announcements, feedback management and account settings. Administrators use the management portal rather than personal travel features.

## Requirements

- Git
- Node.js 22.x, version **22.13 or newer**, with npm. The project was checked using Node.js 22.16.
- A MongoDB Atlas connection, or a local MongoDB replica set
- mkcert for locally trusted development certificates

Check your installed versions:

```bash
git --version
node --version
npm --version
```

MongoDB does not need to be installed locally when using Atlas. A standalone local MongoDB server is insufficient because some operations use database transactions.

## 1. Download the project

```bash
git clone --branch feature/admin-portal-and-security-plan https://github.com/CheeWei323/smart-travel-planner.git
cd smart-travel-planner
```

If you already have a clean checkout, update the same branch:

```bash
git fetch origin
git switch feature/admin-portal-and-security-plan
git pull --ff-only
```

Save any uncommitted work before switching branches or pulling updates.

## 2. Install dependencies

Run this from the main project folder, where the root `package.json` is located:

```bash
npm run setup
```

This installs dependencies for the root project, backend and frontend. The first installation may also download a MongoDB executable used by the optional demo and automated tests.

On Windows, if PowerShell blocks `npm.ps1`, use Command Prompt or replace `npm` with `npm.cmd`.

## 3. Configure the backend

Place the supplied development environment file at **`backend/.env`**. If no configured file is available, copy `backend/.env.example` to `backend/.env` and enter your settings. Keep an existing configured `.env`.

```text
smart-travel-planner/
  backend/
    .env
    .env.example
    server.js
  frontend/
  package.json
```

The filename must be exactly `.env`, not `.env.txt`. The server loads `backend/.env`; editing `.env.example` alone does not configure the application.

| Variable | Local setup |
| --- | --- |
| `MONGO_URI` | Your MongoDB connection string, including the intended database name. Required. |
| `JWT_SECRET` | A long random signing secret. Keep the same value across API restarts. Required. |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://127.0.0.1:5173` |
| `COOKIE_SECURE` | `true` for the HTTPS website and its API proxy. |
| `APP_TIMEZONE` | `Asia/Kuala_Lumpur` |
| `WEATHER_API_KEY` | Optional OpenWeatherMap key for current weather. |
| `PEXELS_API_KEY` | Optional Pexels key for destination photos. |
| `ADMIN_EMAIL` | Only needed when creating the initial administrator. |
| `ADMIN_PASSWORD` | Only needed when creating the initial administrator. |
| `ADMIN_USERNAME` | Administrator display name, such as `Admin`. |

The real `.env` is ignored by Git. Commit `.env.example` with placeholders. Provider keys belong in the backend environment file. Planning still works without weather and photo keys, and destinations can be entered manually when location search is unavailable.

No `frontend/.env` is needed for normal local setup. The browser uses HTTPS for both website and `/api` requests. Vite forwards `/api` to the backend at `http://127.0.0.1:5000` on the same computer. Direct access to that backend port still uses HTTP.

### MongoDB Atlas access

In the Atlas project, add the computer's public IP under **Network Access / IP Access List**. Check that the database username and password in `MONGO_URI` are correct. All computers using the same database connection share the same data.

## 4. Start the application

### Create local HTTPS certificates once per computer

Install mkcert using its [official Windows instructions or release binaries](https://github.com/FiloSottile/mkcert#installation). When using the Windows x64 binary, rename it to `mkcert.exe`. Keep the program outside the project folder.

From the main project folder, run:

```bash
mkcert -install
mkcert -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1
```

`mkcert -install` adds a local development certificate authority to the computer's trust store. Each developer generates their own certificates. The two project certificate files are ignored by Git. Keep the mkcert CA private key outside the repository and private to this computer.

If `mkcert.exe` is not on PATH, use its full path instead. For example, in Command Prompt, if it was saved in Downloads:

```bat
"%USERPROFILE%\Downloads\mkcert.exe" -install
"%USERPROFILE%\Downloads\mkcert.exe" -cert-file localhost+2.pem -key-file localhost+2-key.pem localhost 127.0.0.1 ::1
```

Certificate paths are resolved from the configuration file, so commands work from either the main folder or `frontend`. Both development and preview servers require certificates. A production build creates static files and does not need these local keys.

### Run both services

From the main project folder:

```bash
npm run dev
```

| Service | Address |
| --- | --- |
| Website | https://127.0.0.1:5173 |
| API through the HTTPS website proxy | https://127.0.0.1:5173/api |
| Backend listener on this computer | http://127.0.0.1:5000 |
| Database health check | http://127.0.0.1:5000/api/health |

Open **https://127.0.0.1:5173** in your browser. Keep the terminal running. Press **Ctrl+C** to stop both services.

Use one hostname consistently when accessing the system. Restart the backend after changing its environment settings.

## 5. Sign in

### Traveler account

Register on the website, then log in. Registration creates a normal traveler account. New passwords require at least **15 characters** and cannot appear on the local common-password blocklist. Spaces are allowed. Inputs exceeding bcrypt's 72-byte limit are rejected.

Registration requires agreement to the Privacy Policy and records the time of consent. API registrations must include `privacyConsent: true` in their JSON body. Existing accounts remain usable without registering again. In account settings, **Download my data** exports the signed-in user's profile, travel plans, itineraries and feedback as JSON.

### Existing administrator

Log in with an existing administrator account. The website opens `/admin` automatically. Normal registration does not create administrators. An existing administrator can manage account roles through **Users**.

### Initial administrator for a new database

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_USERNAME` in `backend/.env`.
2. Choose an email that is not already registered as an ordinary user. The password must meet the same policy as registration.
3. Run this from the main project folder:

```bash
npm run seed:admin
```

4. Wait for `Administrator created. You can now log in.`
5. Start the system and sign in with those details.

The command leaves an existing administrator's password and status unchanged. It refuses to promote an existing ordinary account automatically.

## Session behaviour

- Five consecutive incorrect passwords temporarily lock new logins for 15 minutes. Refreshing the page does not reset the lock.
- Sessions expire after two hours. Log in again when a session ends.
- Logout, password changes and account suspension invalidate earlier sessions for that account on all devices, including Postman.
- Authentication uses an HttpOnly cookie. Old Bearer tokens are unsupported. After updating an older checkout, refresh the website and sign in again.

Local browser traffic uses Vite HTTPS with secure, HttpOnly cookies. Cookie names use the `__Host-` prefix, `Path=/` and `SameSite=Lax`. The API listener itself still uses HTTP, so use the HTTPS proxy address for authenticated local requests. This configuration covers local development. Production deployment requires its own HTTPS server or reverse proxy and trusted certificates.

## Postman setup

Use **`https://127.0.0.1:5173/api`** as the base address, with both services running. Secure cookies require HTTPS. Keep certificate verification enabled. If Postman does not trust the local CA, add the public `rootCA.pem` from the folder shown by `mkcert -CAROOT` under its CA certificate settings.

1. Set each request's **Authorization** to **No Auth**. Under **Settings**, leave **Disable cookie jar** switched **off**. Remove manually entered `Cookie` headers.
2. Send `GET /auth/csrf`. Copy the returned `csrfToken`. Postman stores the nonce cookie automatically.
3. Send `POST /auth/login` with **Body > raw > JSON** containing your `email` and `password`. Add the copied value as the `X-CSRF-Token` header.
4. A successful login returns `200`, account details and a new `csrfToken`. Postman stores the session cookie automatically. Use the new CSRF value for subsequent POST, PUT, PATCH and DELETE requests.
5. Send `GET /auth/me` to check the current account. GET requests do not need the CSRF header.
6. `GET /admin/stats` returns `403` for an ordinary user and `200` for an administrator. Sign in inside Postman as the intended account before checking its permissions.

The website and Postman keep separate cookie jars. Website login does not refresh Postman's session. If a CSRF value becomes stale, request `/auth/csrf` again before repeating the intended action.

## Useful commands

Run these from the main project folder:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the backend and frontend together. |
| `npm run backend` | Start only the backend. |
| `npm run frontend` | Start only the frontend. |
| `npm run seed:admin` | Create the initial administrator for a new database. |
| `npm run lint --prefix frontend` | Check frontend code. |
| `npm run build` | Build the frontend into `frontend/dist`. |

### Optional temporary demo

Stop the normal backend first. Run `npm run dev:demo --prefix backend` in one terminal and `npm run frontend` in another.

- Traveler: `traveler@example.test`
- Administrator: `admin@example.test`
- Password for both demo accounts: `Demo travel sample passphrase`

The demo uses temporary data rather than the configured Atlas database. These demo accounts are not created in the normal database.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Missing `MONGO_URI` or `JWT_SECRET` | Put the configured file at `backend/.env`, check the filename and restart the backend. |
| MongoDB connection fails | Check the connection string, database credentials and Atlas IP access entry. |
| Port `5000` or `5173` is occupied | Stop the earlier project terminal with Ctrl+C before starting another copy. |
| Local HTTPS certificates are missing | Generate the two PEM files in the main project folder using the mkcert steps above. |
| Browser reports an untrusted certificate | Install this computer's mkcert CA, regenerate its local certificate and restart the browser. |
| Login reports that the origin is not allowed | Set `FRONTEND_URL=https://127.0.0.1:5173` in `backend/.env` and restart the backend. |
| Admin setup reports `Email must contain 1–254 characters` | Set the admin variables in `backend/.env`, rather than only `.env.example`. |
| Admin setup finds an ordinary account | Use an unused email for initial setup, or change the account's role through an existing administrator. |
| Login reports a temporary lock | Wait for the displayed remaining time. Page refresh and backend restart do not remove the stored lock. |
| Login returns `429 Too Many Requests` | The separate IP limit is 50 registration/login requests per 15 minutes. Wait for that window to reset. |
| Postman returns `401` | Log in inside Postman again, confirm cookies are enabled and use the same hostname. Website logout also revokes the account's Postman session. |
| Postman returns `403 CSRF_INVALID` | Get fresh proof from `/auth/csrf` and send it in `X-CSRF-Token` for the intended request. |
| Personal travel pages redirect to `/admin` | The current account is an administrator. Use a traveler account for personal planning. |
| Weather or photos are unavailable | Check optional provider keys and availability. Other planning features remain usable. |
