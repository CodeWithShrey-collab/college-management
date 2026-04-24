package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "event_announcement")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    @Column(nullable = false)
    private String title;

    private String category;

    @Column(name = "event_date")
    private String eventDate;

    private String venue;

    @Column(length = 2000)
    private String message;
}
