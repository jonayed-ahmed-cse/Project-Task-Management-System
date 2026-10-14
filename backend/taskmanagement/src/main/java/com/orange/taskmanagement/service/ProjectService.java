
package com.orange.taskmanagement.service;

import com.orange.taskmanagement.dto.ProjectRequest;
import com.orange.taskmanagement.entity.Project;
import com.orange.taskmanagement.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository repository;

    public ProjectService(ProjectRepository repository) {
        this.repository = repository;
    }

    public List<Project> getAll() {
        return repository.findAll();
    }

    public Project getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"
                ));
    }

    public Project create(ProjectRequest request) {
        validateDates(request);

        if (repository.existsByProjectCode(request.projectCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project code already exists"
            );
        }

        Project project = new Project();
        copyFields(project, request);

        return repository.save(project);
    }

    public Project update(Long id, ProjectRequest request) {
        Project project = getById(id);
        validateDates(request);

        if (repository.existsByProjectCodeAndIdNot(
                request.projectCode(), id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project code already exists"
            );
        }

        copyFields(project, request);
        return repository.save(project);
    }

    public void delete(Long id) {
        Project project = getById(id);
        repository.delete(project);
    }

    private void validateDates(ProjectRequest request) {
        if (request.startDate() != null
                && request.endDate() != null
                && request.endDate().isBefore(request.startDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date"
            );
        }
    }

    private void copyFields(Project project, ProjectRequest request) {
        project.setProjectCode(request.projectCode());
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setStatus(request.status());
    }
}