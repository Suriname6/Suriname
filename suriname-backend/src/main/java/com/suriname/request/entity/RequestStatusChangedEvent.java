package com.suriname.request.entity;

public record RequestStatusChangedEvent(
        Long requestId,
        Request.Status from,
        Request.Status to,
        String changedBy,
        String notes
) {}

