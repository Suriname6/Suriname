package com.suriname.admin;

import java.time.LocalDateTime;

public interface TodayRowProjection {
	Long getId();
    String getRequestNo();
    String getCustomer();
    String getProduct();
    String getStatus();
    String getEngineer();
    LocalDateTime getCreatedAt();
    String getAssignStatus();
}
