package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "exam_record")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_id", nullable = false, unique = true)
    private String examId;

    @Column(nullable = false)
    private String course;

    @Column(name = "exam_date")
    private String examDate;

    @Column(name = "time_slot")
    private String slot;

    private String hall;

    @Column(name = "exam_type")
    private String type;
}
