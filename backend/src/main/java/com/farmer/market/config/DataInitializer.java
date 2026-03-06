package com.farmer.market.config;

import com.farmer.market.entity.User;
import com.farmer.market.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {
            try {
                if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(User.Role.ADMIN);
                admin.setFullName("System Administrator");
                admin.setEmail("admin@farmermarket.com");
                admin.setPhone("0000000000");
                admin.setAddress("Admin Central");
                admin.setEnabled(true);
                userRepository.save(admin);
                System.out.println("Default Admin Account Created: admin / admin123");
            } else {
                // FORCE update existing admin to ensure it's always accessible with default credentials
                userRepository.findByUsername("admin").ifPresent(admin -> {
                    admin.setPassword(passwordEncoder.encode("admin123"));
                    admin.setEnabled(true);
                    admin.setRole(User.Role.ADMIN);
                    userRepository.save(admin);
                    System.out.println("ADMIN ACCOUNT SYNCED: admin / admin123");
                });

                // ALSO: Enable all existing users to fix the "Simple Flow" transition
                userRepository.findAll().forEach(u -> {
                    if (!u.isEnabled()) {
                        u.setEnabled(true);
                        userRepository.save(u);
                        System.out.println("Auto-enabled existing user: " + u.getUsername());
                    }
                });
            } } catch (Exception e) {
                System.err.println("DataInitializer Error: " + e.getMessage());
            }
        };
    }
}
