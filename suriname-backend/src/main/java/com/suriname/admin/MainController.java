package com.suriname.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.suriname.admin.MainDto.TodayResponse;
import com.suriname.admin.MainDto.WeekResponse;

@RestController
@RequestMapping("/api/main/admin")
@RequiredArgsConstructor
public class MainController {
	
	  private final MainService service;

	    // 오늘 현황 + 오늘 접수 목록
	    @GetMapping("/today")
	    public TodayResponse today() {
	        return service.getToday();
	    }

	    // 이번 주 요약 + TOP5
	    @GetMapping("/week")
	    public WeekResponse week() {
	        return service.getWeek();
	    }

}
