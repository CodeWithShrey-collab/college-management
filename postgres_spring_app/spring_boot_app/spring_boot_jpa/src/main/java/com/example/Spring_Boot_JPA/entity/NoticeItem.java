package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "notice_item")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "notice_id", nullable = false, unique = true)
    private String noticeId;

    @Column(nullable = false)
    private String title;

    private String category;

    private String priority;

    @Column(name = "notice_date")
    private String noticeDate;

    @Column(length = 2000)
    private String message;
}
