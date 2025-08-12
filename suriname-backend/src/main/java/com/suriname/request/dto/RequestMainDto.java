package com.suriname.request.dto;
import java.util.Map;

public record RequestMainDto (
	  long todayCompletedCount,
	    long weekCompletedCount,
	    long monthCompletedCount, 
	    Map<String, Long> statusCounts
	 )
{}
