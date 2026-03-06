package com.farmer.market.controller;

import com.farmer.market.entity.Order;
import com.farmer.market.entity.User;
import com.farmer.market.repository.UserRepository;
import com.farmer.market.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class AdminController {

    private final UserRepository userRepository;
    private final OrderService orderService;
    private final com.farmer.market.repository.ProductRepository productRepository;
    private final com.farmer.market.repository.OrderItemRepository orderItemRepository;
    private final com.farmer.market.repository.OrderRepository orderRepository;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.Map<String, String>> deleteUser(@org.springframework.web.bind.annotation.PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // 1. If farmer, delete their product history
            if ("FARMER".equals(user.getRole().name())) {
                // Delete all items referencing their products in ANY order
                orderItemRepository.deleteByProductFarmerId(id);
                // Delete their products
                productRepository.deleteByFarmerId(id);
            }

            // 2. If consumer, delete their orders
            if ("CONSUMER".equals(user.getRole().name())) {
                // Delete their orders (cascades to order items)
                orderService.deleteOrdersByUserId(id);
            }
            
            // 3. Delete the user
            userRepository.delete(user);
            
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "User " + user.getUsername() + " and all related data deleted.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Could not delete user: " + e.getMessage());
        }
    }

    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.farmer.market.entity.Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }
}
