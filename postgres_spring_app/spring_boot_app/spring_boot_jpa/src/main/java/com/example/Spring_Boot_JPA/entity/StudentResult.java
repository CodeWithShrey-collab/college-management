package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "student_result")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String subject;

    private Integer marks;

    private String grade;
}
