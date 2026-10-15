# User Guide

## Start

Start PostgreSQL, Spring Boot and Angular as described in [SETUP.md](SETUP.md), then visit `http://localhost:4200/dashboard`.

## Dashboard

Use the Project and Task Status filters to narrow the displayed statistics and task lists. Review completion rate, pending/in-progress/completed counts, recent activity, upcoming due dates and overdue tasks. Values come from API data; they are not static placeholders. In the reviewed implementation, the frontend loads all task pages for dashboard calculations.

## Projects

1. Open **Projects** in the sidebar.
2. Search/filter the list to locate a project.
3. Choose **Add Project** to open `/projects/new`.
4. Enter unique code, name, optional description and dates, and a project status.
5. Save, then return to the list.
6. Use row icons for **Details** (popup with full description), **Edit** (dedicated edit URL) and **Delete** (confirmation).

## Categories

1. Open **Categories**.
2. Use **Add Category** to create a reusable task category.
3. Provide a unique name and optional description.
4. Use Details/Edit/Delete actions on existing records.

## Tasks

1. Create a Project and Category first.
2. Open **Tasks**, then **Add Task**.
3. Enter title, optional description, priority, status, due date and select Project and Category.
4. Save and return to the task list.
5. Use keyword/project/status/priority filters and pagination to find tasks.
6. Open **Details** for full task information, **Edit** to update, or **Delete** with confirmation.

## Validation and error feedback

The frontend uses Reactive Forms and field-level messages. Required fields are checked before saving; API failures display feedback. The user reported successful manual checks for empty required fields, missing task associations, unsaved form navigation, duplicate project code and backend connection errors. Unsaved-change behavior is associated with the later validation patch and should be verified in the installed version.

## Suggested demo walkthrough (5–7 minutes)

1. Open Dashboard and explain live totals/filters.
2. Create a Category (e.g., Development).
3. Create a Project (e.g., Website Refresh).
4. Create a Task assigned to both.
5. Filter Tasks by project/priority/status.
6. Show the Details popup with the full description.
7. Edit status to Completed and revisit Dashboard.
8. Demonstrate form validation and safe delete confirmation.

## Notes

No login or role-based permissions are present in the reviewed code. This is a local demo; use sample data and avoid entering sensitive personal/business information.
