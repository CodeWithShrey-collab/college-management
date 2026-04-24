package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.NoticeItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoticeItemRepository extends JpaRepository<NoticeItem, Long> {
}
