package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.EventAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventAnnouncementRepository extends JpaRepository<EventAnnouncement, Long> {
}
