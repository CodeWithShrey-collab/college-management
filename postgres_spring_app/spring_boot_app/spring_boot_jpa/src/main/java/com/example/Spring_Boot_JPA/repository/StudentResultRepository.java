package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.StudentResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentResultRepository extends JpaRepository<StudentResult, Long> {
    List<StudentResult> findAllByStudentIdOrderByIdAsc(String studentId);
    Optional<StudentResult> findByStudentIdAndSubject(String studentId, String subject);
}
