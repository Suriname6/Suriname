package com.suriname.payment;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "portone")
@Getter
@Setter
public class PortOneConfig {
    private String secretKey;
    private String clientKey;
}
