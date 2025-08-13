package com.suriname;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@SpringBootApplication
@EnableScheduling
public class SurinameApplication {

    private static final String STARTED_AT = Instant.now().toString();

    public static void main(String[] args) {
        SpringApplication.run(SurinameApplication.class, args);
    }

    @PostConstruct
    public void logStartedAt() {
        System.out.println("🕒 Backend startedAt: " + STARTED_AT);
    }

    @RestController
    static class MetaController {
        @GetMapping("/api/_meta")
        public Map<String, String> meta() {
            return Map.of("startedAt", STARTED_AT);
        }
    }
}
