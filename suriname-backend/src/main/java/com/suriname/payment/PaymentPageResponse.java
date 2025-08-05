package com.suriname.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPageResponse {
    private List<PaymentDto> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int size;
    private boolean first;
    private boolean last;
}