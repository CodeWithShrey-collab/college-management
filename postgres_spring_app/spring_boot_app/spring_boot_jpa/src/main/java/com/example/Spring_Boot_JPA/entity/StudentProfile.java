package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(nullable = false)
    private String name;

    private String email;

    private String department;

    private String semester;

    private Integer attendance;

    @Column(precision = 4, scale = 2)
    private BigDecimal cgpa;

    @Column(name = "fee_status")
    private String feeStatus;

    @Column(name = "fee_due")
    private Integer feeDue;

    private String mentor;

    private String phone;

    @Column(name = "login_status")
    private String loginStatus;
}
