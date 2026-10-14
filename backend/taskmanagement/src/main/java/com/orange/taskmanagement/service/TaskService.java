
package com.orange.taskmanagement.service;

import com.orange.taskmanagement.dto.TaskRequest;
import com.orange.taskmanagement.dto.TaskResponse;
import com.orange.taskmanagement.entity.Project;
import com.orange.taskmanagement.entity.Task;
import com.orange.taskmanagement.entity.TaskCategory;
import com.orange.taskmanagement.enums.TaskPriority;
import com.orange.taskmanagement.enums.TaskStatus;
import com.orange.taskmanagement.repository.ProjectRepository;
import com.orange.taskmanagement.repository.TaskCategoryRepository;
import com.orange.taskmanagement.repository.TaskRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskCategoryRepository categoryRepository;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            TaskCategoryRepository categoryRepository) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getAll(
            int page,
            int size,
            String keyword,
            Long projectId,
            TaskStatus status,
            TaskPriority priority) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid page or size"
            );
        }

        Specification<Task> spec = (root, query, cb) ->
                cb.conjunction();

        if (keyword != null && !keyword.isBlank()) {
            String search = "%" + keyword.trim().toLowerCase() + "%";

            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("title")), search));
        }

        if (projectId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("project").get("id"), projectId));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), status));
        }

        if (priority != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("priority"), priority));
        }

        Pageable pageable = PageRequest.of(page, size);

        return taskRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TaskResponse getById(Long id) {
        return toResponse(findTask(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        copyFields(task, request);

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = findTask(id);
        copyFields(task, request);

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        Task task = findTask(id);
        taskRepository.delete(task);
    }

    private Task findTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Task not found"
                ));
    }

    private void copyFields(Task task, TaskRequest request) {

        Project project = projectRepository
                .findById(request.projectId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"
                ));

        TaskCategory category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Category not found"
                ));

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus(request.status());
        task.setDueDate(request.dueDate());
        task.setProject(project);
        task.setCategory(category);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getCategory().getId(),
                task.getCategory().getName()
        );
    }
}