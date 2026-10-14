#!/usr/bin/env bash
set -euo pipefail

API="http://localhost:8080/api"
PREFIX="DEMO26"

echo "Checking backend..."
curl -fsS "$API/projects" > /dev/null
curl -fsS "$API/task-categories" > /dev/null
curl -fsS "$API/tasks?page=0&size=1" > /dev/null

echo "Backend is running."

# Create or reuse project by projectCode
create_project() {
  local code="$1" name="$2" status="$3"

  local existing
  existing=$(curl -fsS "$API/projects" |
    jq -r --arg code "$code" \
      '.[] | select(.projectCode == $code) | .id' |
    head -n 1)

  if [[ -n "$existing" ]]; then
    echo "$existing"
    return
  fi

  curl -fsS -X POST "$API/projects" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg code "$code" \
      --arg name "$name" \
      --arg status "$status" \
      '{
        projectCode: $code,
        name: $name,
        description: "Bulk testing project",
        startDate: "2026-10-14",
        endDate: "2026-11-30",
        status: $status
      }')" | jq -r '.id'
}

# Create or reuse category by name
create_category() {
  local name="$1"

  local existing
  existing=$(curl -fsS "$API/task-categories" |
    jq -r --arg name "$name" \
      '.[] | select(.name == $name) | .id' |
    head -n 1)

  if [[ -n "$existing" ]]; then
    echo "$existing"
    return
  fi

  curl -fsS -X POST "$API/task-categories" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg name "$name" \
      '{
        name: $name,
        description: "Bulk testing category"
      }')" | jq -r '.id'
}

echo ""
echo "Creating projects..."

P1=$(create_project "DEMO26-WEB" "E-Commerce Website" "IN_PROGRESS")
P2=$(create_project "DEMO26-MOB" "Mobile Banking App" "PLANNED")
P3=$(create_project "DEMO26-CRM" "Customer CRM System" "IN_PROGRESS")
P4=$(create_project "DEMO26-HRM" "HR Management System" "ON_HOLD")
P5=$(create_project "DEMO26-ERP" "Enterprise ERP System" "PLANNED")

PROJECT_IDS=("$P1" "$P2" "$P3" "$P4" "$P5")

echo "Projects ready: ${PROJECT_IDS[*]}"

echo ""
echo "Creating categories..."

C1=$(create_category "Demo Backend")
C2=$(create_category "Demo Frontend")
C3=$(create_category "Demo Database")
C4=$(create_category "Demo UI UX")
C5=$(create_category "Demo Testing")
C6=$(create_category "Demo DevOps")

CATEGORY_IDS=("$C1" "$C2" "$C3" "$C4" "$C5" "$C6")

echo "Categories ready: ${CATEGORY_IDS[*]}"

TITLES=(
  "Design application architecture"
  "Create database schema"
  "Implement user registration"
  "Implement login API"
  "Build dashboard interface"
  "Create project management page"
  "Develop task management API"
  "Implement category management"
  "Add form validation"
  "Create responsive navigation"
  "Implement search functionality"
  "Add advanced filters"
  "Implement pagination"
  "Build reporting dashboard"
  "Create notification service"
  "Write unit tests"
  "Write integration tests"
  "Fix authentication bugs"
  "Optimize database queries"
  "Add API error handling"
  "Create user profile page"
  "Implement role management"
  "Build settings page"
  "Improve UI accessibility"
  "Configure deployment pipeline"
  "Write API documentation"
  "Perform security testing"
  "Test mobile responsiveness"
  "Optimize frontend performance"
  "Prepare final release"
)

PRIORITIES=("LOW" "MEDIUM" "HIGH")
STATUSES=("PENDING" "IN_PROGRESS" "COMPLETED")

echo ""
echo "Creating 30 tasks..."

created=0
skipped=0

# Fetch existing tasks using pagination
existing_titles=""
page=0

while true; do
  response=$(curl -fsS \
    "$API/tasks?page=$page&size=20")

  titles=$(jq -r '.content[].title' <<< "$response")

  existing_titles+="$titles"$'\n'

  last=$(jq -r '.last' <<< "$response")

  if [[ "$last" == "true" ]]; then
    break
  fi

  page=$((page + 1))
done

for i in "${!TITLES[@]}"; do
  number=$((i + 1))
  title="DEMO26 - ${TITLES[$i]}"

  if grep -Fxq "$title" <<< "$existing_titles"; then
    echo "SKIP: $title"
    skipped=$((skipped + 1))
    continue
  fi

  project_index=$((i % 5))
  category_index=$((i % 6))
  priority_index=$((i % 3))
  status_index=$(((i / 3) % 3))

  project_id="${PROJECT_IDS[$project_index]}"
  category_id="${CATEGORY_IDS[$category_index]}"

  priority="${PRIORITIES[$priority_index]}"
  status="${STATUSES[$status_index]}"

  due_day=$((1 + (i % 28)))
  due_date=$(printf "2026-11-%02d" "$due_day")

  payload=$(jq -n \
    --arg title "$title" \
    --arg description "Generated for CRUD, filter and pagination testing" \
    --arg priority "$priority" \
    --arg status "$status" \
    --arg dueDate "$due_date" \
    --argjson projectId "$project_id" \
    --argjson categoryId "$category_id" \
    '{
      title: $title,
      description: $description,
      priority: $priority,
      status: $status,
      dueDate: $dueDate,
      projectId: $projectId,
      categoryId: $categoryId
    }')

  curl -fsS -X POST "$API/tasks" \
    -H "Content-Type: application/json" \
    -d "$payload" > /dev/null

  echo "CREATED [$number/30]: $title"
  created=$((created + 1))
done

echo ""
echo "=================================="
echo "Bulk Data Operation Completed"
echo "Projects: 5 prepared"
echo "Categories: 6 prepared"
echo "Tasks created: $created"
echo "Tasks skipped: $skipped"
echo "=================================="
