package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.ExamRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRecordRepository extends JpaRepository<ExamRecord, Long> {
}
