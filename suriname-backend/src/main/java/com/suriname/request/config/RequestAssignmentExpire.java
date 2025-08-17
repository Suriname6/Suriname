package com.suriname.request.config;

import com.suriname.request.entity.RequestAssignmentLog;
import com.suriname.request.repository.RequestAssignmentLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@EnableScheduling
@Configuration
class RequestAssignmentSchedulingConfig {}

@Service
@RequiredArgsConstructor
public class RequestAssignmentExpire {
    private final RequestAssignmentLogRepository requestAssignmentLogRepository;

    @Scheduled(cron = "0 */10 * * * *")
    @Transactional
    public void expireUnacceptedAssignment(){
        LocalDateTime threshold = LocalDateTime.now().minusDays(2);
        LocalDateTime now = LocalDateTime.now();

        int affected = requestAssignmentLogRepository.expireAllPendingOlderThan(
                threshold,
                RequestAssignmentLog.AssignmentStatus.PENDING,
                RequestAssignmentLog.AssignmentStatus.EXPIRED,
                now
        );
    }

}

