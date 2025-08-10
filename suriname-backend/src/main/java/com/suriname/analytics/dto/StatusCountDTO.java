package com.suriname.analytics.dto;

public record StatusCountDTO(
        long receivedCount,
        long repairingCount,
        long waitingForPaymentCount,
        long waitingForDeliveryCount,
        long completedCount
) {}