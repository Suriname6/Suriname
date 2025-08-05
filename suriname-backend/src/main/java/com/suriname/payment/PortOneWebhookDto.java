package com.suriname.payment;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PortOneWebhookDto {
    private String eventType;
    private JsonNode data;
}