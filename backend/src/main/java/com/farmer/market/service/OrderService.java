package com.farmer.market.service;

import com.farmer.market.entity.Order;
import com.farmer.market.entity.OrderItem;
import com.farmer.market.entity.Product;
import com.farmer.market.entity.User;
import com.farmer.market.entity.Notification;
import com.farmer.market.repository.NotificationRepository;
import com.farmer.market.repository.OrderRepository;
import com.farmer.market.repository.ProductRepository;
import com.farmer.market.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.farmer.market.repository.OrderItemRepository orderItemRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Transactional
    public List<Order> placeOrder(OrderRequest request, String username) {
        try {
            User consumer = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            System.out.println("Placing order for user: " + username);

            List<Order> savedOrders = new ArrayList<>();
            
            // Map to group items by farmer
            java.util.Map<Long, List<OrderItemRequest>> itemsByFarmer = new java.util.HashMap<>();
            
            for (OrderItemRequest itemRequest : request.items()) {
                Product product = productRepository.findById(itemRequest.productId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemRequest.productId()));
                
                Long farmerId = product.getFarmer().getId();
                itemsByFarmer.computeIfAbsent(farmerId, k -> new ArrayList<>()).add(itemRequest);
            }

            for (java.util.Map.Entry<Long, List<OrderItemRequest>> entry : itemsByFarmer.entrySet()) {
                Order order = new Order();
                order.setConsumer(consumer);
                order.setStatus(Order.OrderStatus.PENDING);
                order.setDeliveryType(request.deliveryType() != null ? request.deliveryType() : Order.DeliveryType.PICKUP);
                order.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() : Order.PaymentMethod.COD);
                
                List<OrderItem> items = new ArrayList<>();
                BigDecimal subTotal = BigDecimal.ZERO;

                for (OrderItemRequest itemRequest : entry.getValue()) {
                    Product product = productRepository.findById(itemRequest.productId()).get();

                    if (product.getQuantity() < itemRequest.quantity()) {
                        throw new RuntimeException("Insufficient quantity for product: " + product.getName());
                    }

                    product.setQuantity(product.getQuantity() - itemRequest.quantity());
                    productRepository.save(product);

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setProduct(product);
                    orderItem.setQuantity(itemRequest.quantity());
                    orderItem.setPrice(product.getPrice());
                    
                    items.add(orderItem);
                    subTotal = subTotal.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
                }

                if (Order.DeliveryType.HOME_DELIVERY.equals(order.getDeliveryType())) {
                    subTotal = subTotal.add(BigDecimal.valueOf(50));
                }

                order.setItems(items);
                order.setTotalAmount(subTotal);
                savedOrders.add(orderRepository.save(order));
            }

            System.out.println(savedOrders.size() + " orders split and saved for user: " + username);
            return savedOrders;
        } catch (Exception e) {
            System.err.println("ORDER FAILURE: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to place order: " + e.getMessage());
        }
    }

    public List<Order> getMyOrders(String username) {
        User consumer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByConsumerId(consumer.getId());
    }

    public List<OrderItem> getFarmerOrders(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderItemRepository.findByProductFarmerId(farmer.getId());
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus(status);
        order = orderRepository.save(order);

        if (status == Order.OrderStatus.SHIPPED) {
            Notification notification = new Notification();
            notification.setUser(order.getConsumer());
            notification.setMessage("Your order #" + order.getId() + " has been shipped!");
            notificationRepository.save(notification);
        } else if (status == Order.OrderStatus.CANCELLED) {
            Notification notification = new Notification();
            notification.setUser(order.getConsumer());
            notification.setMessage("Your order #" + order.getId() + " has been cancelled.");
            notificationRepository.save(notification);
        }

        return order;
    }

    @Transactional
    public Order cancelOrder(Long orderId, String username) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getConsumer().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to cancel this order");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING && order.getStatus() != Order.OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order cannot be cancelled in its current status: " + order.getStatus());
        }

        // Restore quantities
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByConsumerId(userId);
        orderRepository.deleteAll(orders);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public record OrderRequest(
            List<OrderItemRequest> items,
            Order.DeliveryType deliveryType,
            Order.PaymentMethod paymentMethod
    ) {}
    public record OrderItemRequest(Long productId, Integer quantity) {}
}
