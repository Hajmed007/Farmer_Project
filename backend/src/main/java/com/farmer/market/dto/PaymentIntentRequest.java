package com.farmer.market.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentIntentRequest {
    private BigDecimal amount;
    private String currency;
}
