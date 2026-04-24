package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.ScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleEntryRepository extends JpaRepository<ScheduleEntry, Long> {
    List<ScheduleEntry> findAllByScheduleTypeOrderByIdAsc(String scheduleType);
}
