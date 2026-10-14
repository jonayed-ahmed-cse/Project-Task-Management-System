
package com.orange.taskmanagement.service;

import com.orange.taskmanagement.dto.TaskCategoryRequest;
import com.orange.taskmanagement.entity.TaskCategory;
import com.orange.taskmanagement.repository.TaskCategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskCategoryService {

    private final TaskCategoryRepository repository;

    public TaskCategoryService(TaskCategoryRepository repository) {
        this.repository = repository;
    }

    public List<TaskCategory> getAll() {
        return repository.findAll();
    }

    public TaskCategory getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Task category not found"
                ));
    }

    public TaskCategory create(TaskCategoryRequest request) {

        if (repository.existsByName(request.name())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category name already exists"
            );
        }

        TaskCategory category = new TaskCategory();
        category.setName(request.name());
        category.setDescription(request.description());

        return repository.save(category);
    }

    public TaskCategory update(Long id, TaskCategoryRequest request) {

        TaskCategory category = getById(id);

        if (repository.existsByNameAndIdNot(request.name(), id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category name already exists"
            );
        }

        category.setName(request.name());
        category.setDescription(request.description());

        return repository.save(category);
    }

    public void delete(Long id) {
        TaskCategory category = getById(id);
        repository.delete(category);
    }
}