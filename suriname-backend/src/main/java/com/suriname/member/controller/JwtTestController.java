package com.suriname.member.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JwtTestController {

    @GetMapping("/test")
    public String index() {
        return "수리남 프로젝트 초기 환경 테스트";
    }
}
