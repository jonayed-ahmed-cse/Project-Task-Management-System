
package com.orange.taskmanagement.controller;

import com.orange.taskmanagement.dto.TaskCategoryRequest;
import com.orange.taskmanagement.entity.TaskCategory;
import com.orange.taskmanagement.service.TaskCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-categories")
public class TaskCategoryController {

    private final TaskCategoryService service;

    public TaskCategoryController(TaskCategoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskCategory> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public TaskCategory getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskCategory create(
            @Valid @RequestBody TaskCategoryRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public TaskCategory update(
            @PathVariable Long id,
            @Valid @RequestBody TaskCategoryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}