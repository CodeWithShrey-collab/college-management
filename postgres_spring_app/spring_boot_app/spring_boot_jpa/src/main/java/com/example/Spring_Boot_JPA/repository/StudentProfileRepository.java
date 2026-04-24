package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByStudentId(String studentId);
    boolean existsByStudentId(String studentId);
}
