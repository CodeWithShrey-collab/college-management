package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "faculty_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacultyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "faculty_id", nullable = false, unique = true)
    private String facultyId;

    @Column(nullable = false)
    private String name;

    private String department;

    private String specialization;

    @Column(name = "allocated_course")
    private String allocatedCourse;

    @Column(name = "office_hours")
    private String officeHours;

    @Column(name = "login_status")
    private String loginStatus;

    private String email;
}
