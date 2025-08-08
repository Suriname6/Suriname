package com.suriname.customer.dto;

import java.util.List;

import com.suriname.product.dto.ProductDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDetailDto {
	 private Long customerId;
	    private String name;
	    private String email;
	    private String phone;
	    private String address;
	    private String birth;
	    private String status;
	    private List<ProductDto> products;
}
