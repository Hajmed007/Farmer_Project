package com.farmer.market.dto;

public class AuthDto {
    
    public record LoginRequest(String username, String password) {}
    
    public record RegisterRequest(
        String username, 
        String password, 
        String role,
        String fullName,
        String email,
        String phone,
        String address
    ) {}
    
    public record AuthResponse(String token, String username, String role) {}
}
