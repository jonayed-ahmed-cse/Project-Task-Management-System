# Testing, Quality & Submission Checklist

## 1. Build and smoke tests

```bash
# From backend/taskmanagement
mvn test
mvn package

# From frontend/taskmanagement-ui
npm test
npx ng build
```

A successful build verifies compilation, **not** complete runtime behavior. The supplied backend archive contained a basic Spring context test; no comprehensive automated API integration suite was verified.

## 2. Manual acceptance checklist

- [ ] Database and backend start successfully.
- [ ] Angular starts with `--proxy-config proxy.conf.json`.
- [ ] Dashboard loads real counts and filters.
- [ ] Project create/list/edit/details/delete works.
- [ ] Category create/list/edit/details/delete works.
- [ ] Task create/list/edit/details/delete works.
- [ ] Task filters and pagination work for multiple pages.
- [ ] Empty project name is rejected.
- [ ] Empty task title is rejected.
- [ ] Task without project/category is rejected.
- [ ] Duplicate project code returns a useful error.
- [ ] Unsaved changes prompt appears when leaving an edited form (validation patch).
- [ ] Backend outage displays a useful connection error.
- [ ] Deleting a referenced project/category is handled gracefully.
- [ ] Mobile, tablet and desktop layout checked.
- [ ] No sensitive credentials or personal data in repository/screenshots.

**Recorded manual feedback:** the project owner reported six validation scenarios passing on October 15, 2026. The checklist above includes additional recommended checks; do not mark them all passed without running them.

## 3. API smoke commands

```bash
curl -i http://localhost:8080/api/projects
curl -i http://localhost:8080/api/task-categories
curl -i 'http://localhost:8080/api/tasks?page=0&size=5'
curl -i 'http://localhost:8080/api/tasks?page=0&size=101'  # Expect 400
```

Avoid destructive test commands against real or valuable data. Use a separate demo database when possible.

## 4. Documentation / GitHub checklist

- [ ] `README.md` is at repository root.
- [ ] `docs/` contains setup, architecture, API, user and testing guides.
- [ ] Replace `<YOUR_REPOSITORY_URL>` placeholders.
- [ ] Add genuine application screenshots to `docs/screenshots/` if desired.
- [ ] Verify `.gitignore` excludes `node_modules/`, `dist/`, `target/`, `.env`, IDE/temp files.
- [ ] Review tracked files for secrets before publishing.
- [ ] Confirm build/test output on the final commit.
- [ ] Choose and add a license if appropriate.
- [ ] Record known limitations and future work honestly.

## 5. Suggested screenshots

Capture: Dashboard, Projects list, Project create form, Project details modal, Tasks list with filters, Task details modal, Categories list, validation error. Do not insert fabricated screenshots.

## 6. Common non-blocking warnings

`anyComponentStyle` warnings occur when component CSS exceeds configured Angular budgets. They are distinct from build errors. For this demo, the reported Angular build completed successfully with CSS budget warnings. Prefer CSS refactoring before increasing limits substantially.
