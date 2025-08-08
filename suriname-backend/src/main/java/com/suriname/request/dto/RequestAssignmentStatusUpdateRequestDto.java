package com.suriname.request.dto;

import com.suriname.request.entity.RequestAssignmentLog;
import lombok.Getter;

@Getter
public class RequestAssignmentStatusUpdateRequestDto {
        private RequestAssignmentLog.AssignmentStatus status;
        private String reason;
}
