package com.farmer.market.controller;

import com.farmer.market.entity.User;
import com.farmer.market.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setAddress(request.address());

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/bank-details")
    public ResponseEntity<User> updateBankDetails(
            @RequestBody BankDetailsRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBankAccountName(request.bankAccountName());
        user.setBankAccountNumber(request.bankAccountNumber());
        user.setIfscCode(request.ifscCode());
        user.setUpiId(request.upiId());

        return ResponseEntity.ok(userRepository.save(user));
    }

    public record ProfileUpdateRequest(
            String fullName,
            String email,
            String phone,
            String address
    ) {}

    public record BankDetailsRequest(
            String bankAccountName,
            String bankAccountNumber,
            String ifscCode,
            String upiId
    ) {}
}
