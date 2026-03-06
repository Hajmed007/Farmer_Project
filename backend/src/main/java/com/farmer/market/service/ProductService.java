package com.farmer.market.service;

import com.farmer.market.entity.Product;
import com.farmer.market.entity.User;
import com.farmer.market.repository.ProductRepository;
import com.farmer.market.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getProductsByFarmer(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        return productRepository.findByFarmerId(farmer.getId());
    }

    public Product addProduct(ProductRequest request, String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Farmer not found"));
        
        if (farmer.getRole() != User.Role.FARMER) {
            throw new RuntimeException("Only farmers can add products");
        }

        if (request.price() == null || request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Price must be 0 or greater");
        }
        if (request.quantity() == null || request.quantity() < 1) {
            throw new RuntimeException("Quantity must be 1 or greater");
        }

        Product product = new Product();
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        product.setUnit(request.unit() != null ? request.unit() : "kg");
        product.setImageUrl(request.imageUrl());
        product.setFarmer(farmer);

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getFarmer().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to update this product");
        }

        if (request.price() == null || request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Price must be 0 or greater");
        }
        if (request.quantity() == null || request.quantity() < 1) {
            throw new RuntimeException("Quantity must be 1 or greater");
        }

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setQuantity(request.quantity());
        product.setUnit(request.unit() != null ? request.unit() : product.getUnit());
        product.setImageUrl(request.imageUrl());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getFarmer().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to delete this product");
        }

        productRepository.delete(product);
    }

    public record ProductRequest(
            String name,
            String description,
            BigDecimal price,
            Integer quantity,
            String imageUrl,
            String unit
    ) {}
}
