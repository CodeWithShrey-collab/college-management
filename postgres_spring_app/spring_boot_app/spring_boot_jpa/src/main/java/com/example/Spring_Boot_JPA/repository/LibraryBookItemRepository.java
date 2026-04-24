package com.example.Spring_Boot_JPA.repository;

import com.example.Spring_Boot_JPA.entity.LibraryBookItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LibraryBookItemRepository extends JpaRepository<LibraryBookItem, Long> {
    Optional<LibraryBookItem> findByBookId(String bookId);
    boolean existsByBookId(String bookId);
}
