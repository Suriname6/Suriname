package com.suriname.customer.service;

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

import com.suriname.customer.dto.CustomerRegisterDto;
import com.suriname.product.dto.ProductDto;

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
                try {
                    Row row = sheet.getRow(i);
                    if (row == null || isRowEmpty(row)) continue;

                    CustomerRegisterDto dto = parseRow(row);
                    if (dto != null) {
                        customerService.registerCustomer(dto);
                    }
                } catch (Exception e) {
                    System.err.println("엑셀 행 " + (i+1) + " 처리 중 오류: " + e.getMessage());
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
        boolean isValidProduct =
                (product.getProductName() != null && !product.getProductName().isBlank()) ||
                (product.getModelCode() != null && !product.getModelCode().isBlank());

        if (!isValidProduct) return null;

        return dto;
    }

    private String getCellValue(Row row, int idx) {
        if (idx >= row.getLastCellNum()) return "";
        Cell cell = row.getCell(idx);
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue()); 
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
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

