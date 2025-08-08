package com.suriname.request.repository;

import com.suriname.request.dto.RequestListResponseDto;
import com.suriname.request.dto.RequestSearchCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RequestQueryRepository {
    Page<RequestListResponseDto> searchRequestList(RequestSearchCondition condition, Pageable pageable, Long viewerId, String role);
}
