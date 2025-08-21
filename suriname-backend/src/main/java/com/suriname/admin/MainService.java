package com.suriname.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.suriname.admin.MainDto.TodayRequestRowDto;
import com.suriname.admin.MainDto.TodayResponse;
import com.suriname.admin.MainDto.TodayStatsDto;
import com.suriname.admin.MainDto.TopEngineerDto;
import com.suriname.admin.MainDto.WeekDayCountDto;
import com.suriname.admin.MainDto.WeekResponse;
import com.suriname.admin.MainDto.StatsDto; 

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MainService {

    private final MainRepository repo;
    private static final ZoneId ZONE = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");

    private LocalDateTime startOfToday() {
        return LocalDate.now(ZONE).atStartOfDay();
    }
    private LocalDateTime endOfDay(LocalDateTime start) {
        return start.plusDays(1);
    }
    private LocalDateTime startOfThisWeekMonday() {
        LocalDate today = LocalDate.now(ZONE);
        return today.with(DayOfWeek.MONDAY).atStartOfDay();
    }
    private LocalDateTime startOfNextWeekMonday() {
        return startOfThisWeekMonday().plusWeeks(1);
    }

    public TodayResponse getToday() {
        LocalDateTime start = startOfToday();
        LocalDateTime end = endOfDay(start);

        long newRequests = repo.countNewRequestsBetween(start, end);
        long unassigned  = repo.countUnassignedBetween(start, end);
        long inProgress  = repo.countInProgressBetween(start, end);
        long completed   = repo.countCompletedBetween(start, end);

        List<TodayRowProjection> rowsRaw = repo.findTodayRows(start, end);
        List<TodayRequestRowDto> rows = rowsRaw.stream().map(r ->
                TodayRequestRowDto.builder()
                        .id(r.getId())
                        .requestNo(r.getRequestNo())
                        .customer(r.getCustomer())
                        .product(r.getProduct())
                        .status(r.getStatus())
                        .engineer((r.getEngineer() == null || r.getEngineer().isBlank()) ? "-" : r.getEngineer())
                        .createdAt(r.getCreatedAt()
                                .atZone(ZoneId.systemDefault())
                                .withZoneSameInstant(ZONE)
                                .toLocalTime().format(HHMM))
                        .assignStatus(r.getAssignStatus())
                        .build()
        ).toList();

        return TodayResponse.builder()
                .stats(TodayStatsDto.builder()
                        .newRequests(newRequests)
                        .unassigned(unassigned)
                        .inProgress(inProgress)
                        .completed(completed)
                        .build())
                .requests(rows)
                .build();
    }

    public WeekResponse getWeek() {
        LocalDateTime start = startOfThisWeekMonday();
        LocalDateTime end   = startOfNextWeekMonday();

        int total = repo.totalThisWeek(start, end);

        Map<DayOfWeek, String> label = Map.of(
                DayOfWeek.MONDAY, "월",
                DayOfWeek.TUESDAY, "화",
                DayOfWeek.WEDNESDAY, "수",
                DayOfWeek.THURSDAY, "목",
                DayOfWeek.FRIDAY, "금",
                DayOfWeek.SATURDAY, "토",
                DayOfWeek.SUNDAY, "일"
        );

        LocalDate monday = start.toLocalDate();
        List<WeekDayCountDto> byDay = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = monday.plusDays(i);
            byDay.add(WeekDayCountDto.builder()
                    .day(label.get(d.getDayOfWeek()))
                    .count(0)
                    .date(d)
                    .build());
        }

        for (WeekDayCountProjection c : repo.countByDayThisWeek(start, end)) {
            LocalDate d = c.getYmd();
            int idx = (int) Duration.between(monday.atStartOfDay(), d.atStartOfDay()).toDays();
            if (idx >= 0 && idx < 7) {
                byDay.set(idx, WeekDayCountDto.builder()
                        .day(label.get(d.getDayOfWeek()))
                        .count(c.getCnt())
                        .date(d)
                        .build());
            }
        }

        List<TopEngineerDto> topEngineers = repo.topEngineersThisWeek(start, end)
                .stream()
                .map(t -> TopEngineerDto.builder().name(t.getName()).count(t.getCnt()).build())
                .collect(Collectors.toList());

        long newRequests = repo.countNewRequestsBetween(start, end);
        long unassigned  = repo.countUnassignedBetween(start, end);
        long inProgress  = repo.countInProgressBetween(start, end);
        long completed   = repo.countCompletedBetween(start, end);

        return WeekResponse.builder()
                .total(total)
                .byDay(byDay)
                .topEngineers(topEngineers)
                .stats(StatsDto.builder()           
                        .newRequests(newRequests)
                        .unassigned(unassigned)
                        .inProgress(inProgress)
                        .completed(completed)
                        .build())
                .build();
    }
}
