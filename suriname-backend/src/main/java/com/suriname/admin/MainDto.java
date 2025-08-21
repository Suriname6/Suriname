package com.suriname.admin;

import lombok.*;

import java.time.LocalDate;

public class MainDto {
	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class TodayStatsDto {
		private long newRequests;
		private long unassigned;
		private long inProgress;
		private long completed;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class TodayRequestRowDto {
		private Long id;
		private String requestNo;
		private String customer;
		private String product;
		private String status;
		private String engineer;
		private String createdAt;
		private String assignStatus;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class TodayResponse {
		private TodayStatsDto stats;
		private java.util.List<TodayRequestRowDto> requests;
	}
	
	@Getter 
	@Setter 
	@NoArgsConstructor 
	@AllArgsConstructor 
	@Builder
	public static class StatsDto {
	    private long newRequests;
	    private long unassigned;
	    private long inProgress;
	    private long completed;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class WeekDayCountDto {
		private String day;
		private int count;
		private LocalDate date;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class TopEngineerDto {
		private String name;
		private long count;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class WeekResponse {
		private int total;
		private java.util.List<WeekDayCountDto> byDay;
		private java.util.List<TopEngineerDto> topEngineers;
		private StatsDto stats;
	}
}
