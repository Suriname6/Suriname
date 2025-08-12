package com.suriname.admin;

import java.time.LocalDate;

public interface WeekDayCountProjection {
	   LocalDate getYmd();
	    Integer getCnt();
}
