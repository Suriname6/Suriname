package com.suriname.request.dto;

import java.util.Map;

public record StaffMainDto(
    long todayRegisteredCount,   
    long weekRegisteredCount,    
    long monthRegisteredCount,  
    Map<String, Long> statusCounts 
) {}
