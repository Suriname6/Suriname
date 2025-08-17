package com.suriname.request.listener;

import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestStatusChangedEvent;
import com.suriname.requestlog.entity.RequestLog;
import com.suriname.requestlog.repository.RequestStatusLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Component
@RequiredArgsConstructor
public class RequestStatusChangedListener {

    private final RequestStatusLogRepository logRepository;

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void on(RequestStatusChangedEvent e) {
        logRepository.save(RequestLog.builder()
                .request(Request.of(e.requestId()))
                .changedBy(e.changedBy())
                .oldStatus(e.from())
                .newStatus(e.to())
                .notes(e.notes())
                .build());
    }
}
