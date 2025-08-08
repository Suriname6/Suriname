package com.suriname.quote.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotePageResponse {
    private List<QuoteDto> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private int size;
    private boolean first;
    private boolean last;
}