package com.suriname.payment;

import com.suriname.request.entity.Request;
import com.suriname.request.entity.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PortOneClient portOneClient;

    @Transactional
    public PaymentResponseDto createVirtualAccount(Long requestId, int amount) {
        String merchantUid = "REQ-" + requestId + "-" + UUID.randomUUID();

        PortOneClient.PortOneVbankRes res = portOneClient.issueVirtualAccountV2(merchantUid, amount);

        String bank = res.bankCode();
        String account = res.accountNumber();

        Payment payment = Payment.builder()
                .request(Request.of(requestId))
                .merchantUid(merchantUid)
                .account(account)
                .bank(bank)
                .cost(amount)
                .status(Payment.Status.PENDING)
                .memo("가상계좌 발급")
                .build();

        paymentRepository.save(payment);

        return new PaymentResponseDto(account, bank, amount, merchantUid);
    }

    @Transactional
    public void completeByMerchantUid(String merchantUid) {
        Payment payment = paymentRepository.findByMerchantUid(merchantUid)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + merchantUid));

        payment.markCompleted();
    }
}
