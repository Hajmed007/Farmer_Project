package com.farmer.market.repository;

import com.farmer.market.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProductFarmerId(Long farmerId);
    void deleteByProductFarmerId(Long farmerId);
    void deleteByProductId(Long productId);
}
