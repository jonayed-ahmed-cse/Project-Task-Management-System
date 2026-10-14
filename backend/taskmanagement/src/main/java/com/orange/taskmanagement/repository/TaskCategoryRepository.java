
package com.orange.taskmanagement.repository;

import com.orange.taskmanagement.entity.TaskCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskCategoryRepository
        extends JpaRepository<TaskCategory, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}