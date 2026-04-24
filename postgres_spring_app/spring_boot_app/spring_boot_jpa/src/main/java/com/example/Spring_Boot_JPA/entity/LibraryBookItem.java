package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "library_book_item")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryBookItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "book_id", nullable = false, unique = true)
    private String bookId;

    @Column(nullable = false)
    private String title;

    private String author;

    private String status;

    private String borrower;

    @Column(name = "due_date")
    private String dueDate;

    private Integer fine;
}
