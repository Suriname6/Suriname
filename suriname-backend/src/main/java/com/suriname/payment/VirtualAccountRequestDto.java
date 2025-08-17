package com.suriname.payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VirtualAccountRequestDto {
    private Long requestId;         // 수리 요청 ID (payment와 연결됨)
    private String requestNo;       // 접수번호 (requestId 대신 사용 가능)
    private String merchantUid;     // 고유 주문 번호
    private Integer amount;         // 입금 금액
    private String vbankHolder;     // 예금주 이름
    private String vbankDue;        // 입금 마감일 (ISO 8601: "2025-08-07T15:00:00")
    private String customerPhone;   // 고객 휴대폰 번호
}
