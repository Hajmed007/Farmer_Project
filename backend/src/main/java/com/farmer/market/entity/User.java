package com.farmer.market.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String fullName;
    private String email;
    private String phone;
    private String address;

    private String bankAccountName;
    private String bankAccountNumber;
    private String ifscCode;
    private String upiId;

    @Column(nullable = false)
    private boolean enabled = false;

    private String emailVerificationToken;

    public enum Role {
        FARMER,
        CONSUMER,
        ADMIN
    }
}
