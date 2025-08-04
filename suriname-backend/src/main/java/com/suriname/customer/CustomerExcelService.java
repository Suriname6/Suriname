package com.suriname.customer;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.product.ProductDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerExcelService {

    private final CustomerService customerService; 

    public void importFromExcel(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0); 

            for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                CustomerRegisterDto dto = parseRow(row);
                if (dto != null) {
                    customerService.registerCustomer(dto);
                }

            }
        }
    }

    private CustomerRegisterDto parseRow(Row row) {
        CustomerRegisterDto dto = new CustomerRegisterDto();
        dto.setName(getCellValue(row, 0));
        try {
            Cell birthCell = row.getCell(1);
            if (birthCell != null) {
                if (birthCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(birthCell)) {
                    dto.setBirth(birthCell.getLocalDateTimeCellValue().toLocalDate());
                } else {
                    String birthStr = getCellValue(row, 1);
                    if (birthStr != null && !birthStr.isEmpty()) {
                        dto.setBirth(LocalDate.parse(birthStr));  // yyyy-MM-dd
                    }
                }
            }
        } catch (Exception e) {
            dto.setBirth(null);
        }
        dto.setPhone(getCellValue(row, 2));
        dto.setEmail(getCellValue(row, 3));
        dto.setAddress(getCellValue(row, 4));
       
        ProductDto product = new ProductDto();
        product.setCategoryName(getCellValue(row, 5));  
        product.setProductName(getCellValue(row, 6));         
        product.setProductBrand(getCellValue(row, 7));        
        product.setModelCode(getCellValue(row, 8));          
        product.setSerialNumber(getCellValue(row, 9));   

        dto.setProduct(product);
        if (product.getProductName() == null || product.getProductName().isEmpty()) {
            return null;
        }
        return dto;
    }

    private String getCellValue(Row row, int idx) {
        if (idx >= row.getLastCellNum()) return "";
        Cell cell = row.getCell(idx);
        return (cell != null) ? cell.toString().trim() : "";
    }

    
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;

        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !cell.toString().trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

}

