package com.farmer.market.service;

import com.farmer.market.dto.AuthDto;
import com.farmer.market.entity.User;
import com.farmer.market.repository.UserRepository;
import com.farmer.market.security.JwtUtils;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        String validatedPhone = validateAndFormatPhone(request.phone());

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(User.Role.valueOf(request.role().toUpperCase()));
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(validatedPhone);
        user.setAddress(request.address());

        // Initial States - Enabled by default for simple flow
        user.setEnabled(true);
        user.setEmailVerificationToken(java.util.UUID.randomUUID().toString());

        userRepository.save(user);

        // Send real verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getEmailVerificationToken());

        String token = jwtUtils.generateToken(new CustomUserDetails(user));
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        user.setEnabled(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is not verified. Please check your email or phone.");
        }

        System.out.println("LOGIN ATTEMPT: " + user.getUsername() + " | Role: " + user.getRole());

        String token = jwtUtils.generateToken(new CustomUserDetails(user));
        return new AuthDto.AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    private String validateAndFormatPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("Phone number is required.");
        }
        
        PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
        try {
            // libphonenumber needs the plus sign to detect region if not provided
            Phonenumber.PhoneNumber numberProto = phoneUtil.parse(phone, "IN");
            
            if (!phoneUtil.isValidNumber(numberProto)) {
                throw new RuntimeException("The phone number '" + phone + "' is not a valid real-world number for its region.");
            }

            // Additional check: Ensure it's a mobile or fixed-line number (not a premium/short code)
            PhoneNumberUtil.PhoneNumberType type = phoneUtil.getNumberType(numberProto);
            if (type == PhoneNumberUtil.PhoneNumberType.UNKNOWN) {
                throw new RuntimeException("Could not verify the type of this phone number. Please use a standard mobile number.");
            }

            // Always return E.164 format for Twilio consistency (+91...)
            return phoneUtil.format(numberProto, PhoneNumberUtil.PhoneNumberFormat.E164);
        } catch (NumberParseException e) {
            throw new RuntimeException("Invalid phone number format. Please include country code (e.g., +91). Error: " + e.getErrorType());
        }
    }

    // Adaptor class for UserDetails
    private static class CustomUserDetails extends org.springframework.security.core.userdetails.User {
        public CustomUserDetails(User user) {
            super(user.getUsername(), user.getPassword(), user.isEnabled(), true, true, true,
                  java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        }
    }
}
