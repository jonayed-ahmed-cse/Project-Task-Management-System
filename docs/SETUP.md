# Installation, Configuration & Daily Run Guide

## 1. Prerequisites

Ubuntu/Linux with Java 17, Node.js compatible with Angular 22 (development used Node 24 LTS), npm, PostgreSQL, Maven, Git and a terminal. Verify:

```bash
java -version
node -v
npm -v
mvn -version
psql --version
```

Install tools with your normal OS/package manager as needed. Use a supported Java 17 JDK and a compatible Node LTS release. Angular CLI is available locally through `npx`; a global CLI install is not necessary.

## 2. Get the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd project-task-management
```

If already cloned, just `cd` into the project root. Replace the URL placeholder with your own repository URL; none was verified from the supplied archives.

## 3. Database setup

Current `application.properties` is configured for local PostgreSQL at `localhost:5432`, database `task_management`, user `taskmanager`. The password must match the one configured on your machine.

```bash
sudo systemctl start postgresql
pg_lsclusters
sudo -u postgres psql
```

Run only if role/database do not already exist:

```sql
CREATE ROLE taskmanager WITH LOGIN PASSWORD 'CHOOSE_A_LOCAL_PASSWORD';
CREATE DATABASE task_management OWNER taskmanager;
\q
```

Update `backend/taskmanagement/src/main/resources/application.properties` locally. **Never paste your real password into screenshots or commit it to GitHub.** The existing demo backend uses `spring.jpa.hibernate.ddl-auto=update`; it does not require a separate migration command in the reviewed configuration.

## 4. Backend commands

Open **Terminal 1** from repository root:

```bash
cd backend/taskmanagement
mvn spring-boot:run
```

Or `./mvnw spring-boot:run` **only if** the wrapper files are present in your actual checkout. Wait for port 8080. Test from a separate terminal:

```bash
curl -i http://localhost:8080/api/projects
```

Build a jar (optional):

```bash
mvn clean package
```

The packaged jar will be in `target/`. Use `java -jar target/<generated-jar-name>.jar` after identifying its actual filename.

## 5. Frontend commands

Open **Terminal 2** from repository root:

```bash
cd frontend/taskmanagement-ui
npm install
npx ng serve --proxy-config proxy.conf.json
```

Open `http://localhost:4200/dashboard`. `npm install` is required on first setup and when dependencies change; it need not run every morning. If a lockfile exists, `npm ci` is preferable for reproducible installs.

Build and test:

```bash
npx ng build
npm test
```

The frontend's configured dev proxy routes `/api/**` to `http://localhost:8080`. **Do not omit the proxy flag** when using the above start command unless the Angular configuration has separately been updated.

## 6. Every day: minimal startup sequence

**Check PostgreSQL** (Terminal 0):

```bash
pg_lsclusters
# Only if stopped:
sudo systemctl start postgresql
```

**Backend** (Terminal 1):

```bash
cd ~/workspace/project-task-management/backend/taskmanagement
mvn spring-boot:run
```

**Frontend** (Terminal 2):

```bash
cd ~/workspace/project-task-management/frontend/taskmanagement-ui
npx ng serve --proxy-config proxy.conf.json
```

The `~/workspace/...` path is the original developer's machine path; **replace it with your actual cloned project location** on a new machine.

To stop each development server, focus its terminal and press `Ctrl+C`. You normally leave PostgreSQL running as a system service.

## 7. Ports and common errors

| Port | Service | Diagnostic |
|---|---|---|
| 5432 | PostgreSQL | `pg_lsclusters` |
| 8080 | Spring Boot | `sudo lsof -nP -iTCP:8080 -sTCP:LISTEN` |
| 4200 | Angular | `sudo lsof -nP -iTCP:4200 -sTCP:LISTEN` |

For a port conflict, stop only the confirmed stale application process (`kill <PID>`), not Chrome or unrelated processes. If backend starts but frontend shows API errors, check the backend logs and proxy configuration. For PostgreSQL authentication errors, verify role/database/credentials. For Maven errors, confirm Java 17 and dependency access. For Angular errors, confirm Node/npm versions and dependencies.

## 8. Configuration notes

- `application.properties`: backend port, datasource URL/username/password, Hibernate settings.
- `proxy.conf.json`: Angular development proxy.
- `angular.json`: build options, CSS budgets.
- `package.json`: npm scripts and dependencies.
- `pom.xml`: Maven dependencies, Java/Spring Boot versions.

**Security note:** The reviewed demo configuration stores a datasource password directly in `application.properties`. This guide documents the existing behavior without changing the code. Before publishing a public repository, remove real credentials from tracked files and rotate any already-exposed passwords.
