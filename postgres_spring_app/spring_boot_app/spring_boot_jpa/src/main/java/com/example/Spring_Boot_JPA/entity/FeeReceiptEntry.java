package com.example.Spring_Boot_JPA.entity;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "fee_receipt_entry")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeReceiptEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_id", nullable = false, unique = true)
    private String receiptId;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Column(name = "student_name")
    private String studentName;

    private Integer amount;

    private String mode;

    @Column(name = "payment_date")
    private String paymentDate;
}
