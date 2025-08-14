package com.suriname.customer.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomerSearchDto {
	 private String customerName;
	 private String phone;
	 private String email;
	    private String address;
	    private String productName;
	    private String modelCode;
	    private String categoryName;
	    private List<String> manufacturers;
}
