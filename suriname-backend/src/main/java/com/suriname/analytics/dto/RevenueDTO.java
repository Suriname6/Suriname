package com.suriname.analytics.dto;

import java.math.BigDecimal;

public record RevenueDTO(
        Integer label,
        BigDecimal revenue
) {}
