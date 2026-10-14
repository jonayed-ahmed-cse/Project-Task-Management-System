
package com.orange.taskmanagement.repository;

import com.orange.taskmanagement.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    boolean existsByProjectCode(String projectCode);

    boolean existsByProjectCodeAndIdNot(String projectCode, Long id);
}
