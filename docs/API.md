# REST API Reference

**Base URL:** `http://localhost:8080/api` (direct backend), or `/api` through the Angular dev proxy on port 4200.

**Content type:** `application/json` for request bodies. IDs are numeric; dates use ISO `YYYY-MM-DD`. No authentication mechanism was identified in the reviewed code.

## Endpoints

| Method | Endpoint | Description | Typical success |
|---|---|---|---|
| GET | `/projects` | List projects | 200 |
| GET | `/projects/{id}` | Get project | 200 |
| POST | `/projects` | Create project | 201 |
| PUT | `/projects/{id}` | Update project | 200 |
| DELETE | `/projects/{id}` | Delete project | 204 |
| GET | `/task-categories` | List categories | 200 |
| GET | `/task-categories/{id}` | Get category | 200 |
| POST | `/task-categories` | Create category | 201 |
| PUT | `/task-categories/{id}` | Update category | 200 |
| DELETE | `/task-categories/{id}` | Delete category | 204 |
| GET | `/tasks` | Paginated/filtered tasks | 200 |
| GET | `/tasks/{id}` | Get task | 200 |
| POST | `/tasks` | Create task | 201 |
| PUT | `/tasks/{id}` | Update task | 200 |
| DELETE | `/tasks/{id}` | Delete task | 204 |

## Example: Create project

```bash
curl -i -X POST http://localhost:8080/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"projectCode":"DEMO-001","name":"Website Refresh","description":"Update public website","startDate":"2026-10-15","endDate":"2026-11-15","status":"PLANNED"}'
```

Project status values: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `ON_HOLD`. Project code is unique and required (max 30); name is required (max 150); description max 255. Project date ordering is checked by the service layer.

## Example: Create category

```bash
curl -i -X POST http://localhost:8080/api/task-categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Development","description":"Implementation work"}'
```

Name required and unique (max 100); description max 255.

## Example: Create task

First create or list a project and category, then replace `projectId` and `categoryId` with their real IDs:

```bash
curl -i -X POST http://localhost:8080/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"Build dashboard","description":"Implement summary widgets","priority":"HIGH","status":"PENDING","dueDate":"2026-11-01","projectId":1,"categoryId":1}'
```

Task title is required (max 150); priority, status, projectId and categoryId are required. `projectId` and `categoryId` must reference existing records. Valid priorities: `LOW`, `MEDIUM`, `HIGH`. Valid statuses: `PENDING`, `IN_PROGRESS`, `COMPLETED`.

Task response contains:

```json
{
  "id": 1,
  "title": "Build dashboard",
  "description": "Implement summary widgets",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2026-11-01",
  "projectId": 1,
  "projectName": "Website Refresh",
  "categoryId": 1,
  "categoryName": "Development"
}
```

The JSON above is an **illustrative example**, not a captured live response.

## Task pagination and filtering

```bash
curl 'http://localhost:8080/api/tasks?page=0&size=5'
curl 'http://localhost:8080/api/tasks?page=0&size=10&keyword=dashboard'
curl 'http://localhost:8080/api/tasks?page=0&size=10&projectId=1&status=PENDING&priority=HIGH'
```

| Query parameter | Meaning | Default |
|---|---|---|
| `page` | Zero-based page index | 0 |
| `size` | Page size, allowed 1–100 | 10 |
| `keyword` | Case-insensitive match on task **title** | none |
| `projectId` | Filter by project ID | none |
| `status` | Task status enum | none |
| `priority` | Task priority enum | none |

Response is Spring Data `Page<TaskResponse>` JSON, with `content`, `number`, `size`, `totalElements`, `totalPages`, `first`, `last` and related paging metadata. **Do not assume GET `/tasks` returns a plain array.** No explicit task sort order is set in the reviewed service; page ordering should not be relied upon as stable.

## Error responses

The global exception handler explicitly maps:

- **400 Bad Request:** DTO validation failures and invalid page/size.
- **404 Not Found:** missing referenced or requested records.
- **409 Conflict:** database constraint violations (such as duplicate unique fields).

Example error shape:

```json
{"status": 400, "message": "name: must not be blank"}
```

Actual messages vary with the invalid field and exception. Not every possible server exception has a custom handler.

## Update and delete

Use `PUT /api/projects/{id}`, `PUT /api/task-categories/{id}`, or `PUT /api/tasks/{id}` with the corresponding complete request body. Delete with `DELETE .../{id}`; success returns HTTP 204 with no body. Deleting a Project or Category still referenced by Tasks may be rejected by a database constraint; delete/reassign dependent Tasks first.
