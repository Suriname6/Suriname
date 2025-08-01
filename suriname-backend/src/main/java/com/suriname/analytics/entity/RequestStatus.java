package com.suriname.analytics.entity;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public enum RequestStatus {
    RECEIVED,    // 접수
    REPAIRING,  // 수리중
    WAITING_FOR_PAYMENT, // 입금대기
    WAITING_FOR_DELIVERY, // 배송대기
    COMPLETED   // 완료
}
