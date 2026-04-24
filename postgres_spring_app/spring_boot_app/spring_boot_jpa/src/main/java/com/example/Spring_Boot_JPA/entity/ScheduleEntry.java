package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "schedule_entry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_id", nullable = false, unique = true)
    private String scheduleId;

    @Column(name = "schedule_type", nullable = false)
    private String scheduleType;

    @Column(name = "day_name")
    private String dayName;

    @Column(name = "date_value")
    private String dateValue;

    @Column(name = "time_slot")
    private String timeSlot;

    private String title;

    @Column(name = "faculty_name")
    private String facultyName;

    private String room;

    private String venue;
}
