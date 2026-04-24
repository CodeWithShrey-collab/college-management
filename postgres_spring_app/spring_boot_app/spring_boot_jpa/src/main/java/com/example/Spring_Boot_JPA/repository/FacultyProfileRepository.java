package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.FacultyProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByFacultyId(String facultyId);
    boolean existsByFacultyId(String facultyId);
}
