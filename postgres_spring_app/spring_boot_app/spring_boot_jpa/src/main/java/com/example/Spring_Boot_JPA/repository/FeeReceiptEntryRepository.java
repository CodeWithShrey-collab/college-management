package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.FeeReceiptEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeReceiptEntryRepository extends JpaRepository<FeeReceiptEntry, Long> {
    List<FeeReceiptEntry> findAllByOrderByIdDesc();
}
