package com.suriname.request.controller;

import com.suriname.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestRepository requestRepository;

    @GetMapping("/validate/requestno/{requestNo}")
    public ResponseEntity<Boolean> validateRequestNo(@PathVariable String requestNo) {
        boolean exists = requestRepository.findByRequestNo(requestNo).isPresent();
        return ResponseEntity.ok(exists);
    }
}