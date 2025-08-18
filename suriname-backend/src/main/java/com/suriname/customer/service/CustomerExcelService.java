package com.suriname.customer.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.WorkbookFactory;

import com.suriname.customer.dto.CustomerRegisterDto;
import com.suriname.product.dto.CustomerProductDto;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class CustomerExcelService {

    private final CustomerService customerService;
    private static final DataFormatter FMT = new DataFormatter();

    public ResponseEntity<?> importFromExcel(MultipartFile file) throws IOException {
        List<Map<String, String>> failures = new ArrayList<>();
        int success = 0;
        int total = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) { 
            Sheet sheet = workbook.getSheetAt(0);

            final int START_ROW = 1; 
            for (int r = START_ROW; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isRowEmpty(row)) continue;

                total++; 
                try {
                    CustomerRegisterDto dto = parseRow(row);
                    if (dto == null) {
                        failures.add(fail(r, "제품 정보(제품명/모델코드) 중 최소 1개는 필수"));
                        continue;
                    }
                    customerService.registerCustomer(dto);
                    success++;
                } catch (IllegalArgumentException e) {
                    failures.add(fail(r, e.getMessage()));
                } catch (Exception e) {
                    failures.add(fail(r, "알 수 없는 오류"));
                }
            }
        }

        int failureCount = failures.size();

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "message", failureCount == 0 ? "등록 성공" : "일부 항목 등록 실패",
            "data", Map.of(
                "totalCount", total,
                "successCount", success,
                "failureCount", failureCount,
                "failures", failures
            )
        ));
    }

    private Map<String, String> fail(int rowIndex0Based, String reason) {
        Map<String, String> m = new HashMap<>();
        m.put("row", String.valueOf(rowIndex0Based + 1)); 
        m.put("reason", reason);
        return m;
    }

    private CustomerRegisterDto parseRow(Row row) {
        CustomerRegisterDto dto = new CustomerRegisterDto();

        dto.setName(getCellValue(row, 0));

        LocalDate birth = extractBirth(row.getCell(1));
        if (birth == null) {
            String raw = getCellValue(row, 1);
            if (raw != null && !raw.isBlank()) {
                throw new IllegalArgumentException(
                    "생년월일 형식 오류(허용: yyyy-MM-dd, yyyy/M/d, yyyy.M.d, yyyyMMdd)"
                );
            }
        }
        dto.setBirth(birth);

        dto.setPhone(getCellValue(row, 2));
        dto.setEmail(getCellValue(row, 3));
        dto.setAddress(getCellValue(row, 4));

        CustomerProductDto product = new CustomerProductDto();
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
        if (row == null || idx < 0 || idx >= row.getLastCellNum()) return "";
        Cell cell = row.getCell(idx);
        if (cell == null) return "";
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate().toString();
        }
        return FMT.formatCellValue(cell).trim();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !FMT.formatCellValue(cell).trim().isEmpty()) return false;
        }
        return true;
    }

    private LocalDate extractBirth(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                double v = cell.getNumericCellValue();
                if (DateUtil.isCellDateFormatted(cell) || DateUtil.isValidExcelDate(v)) {
                    return DateUtil.getLocalDateTime(v).toLocalDate();
                }
                return parseDateLoose(FMT.formatCellValue(cell).trim());
            } else {
                return parseDateLoose(FMT.formatCellValue(cell).trim());
            }
        } catch (Exception ignore) {
            return null;
        }
    }

    private LocalDate parseDateLoose(String s) {
        if (s == null) return null;

        String v = s.trim()
            .replace('\u00A0', ' ')        
            .replaceAll("\\s+", "")        
            .replaceAll("[\\u2010\\u2011\\u2012\\u2013\\u2014\\u2015\\u2212\\uFF0D\\uFE63\\u2043]", "-")
            .replace('.', '-')             
            .replace('/', '-');

        if (v.matches("^\\d{8}$")) {
            int y = Integer.parseInt(v.substring(0,4));
            int m = Integer.parseInt(v.substring(4,6));
            int d = Integer.parseInt(v.substring(6,8));
            return LocalDate.of(y, m, d);
        }

        try {
            var flex = new java.time.format.DateTimeFormatterBuilder()
                .appendPattern("yyyy-")
                .appendValue(java.time.temporal.ChronoField.MONTH_OF_YEAR, 1, 2, java.time.format.SignStyle.NOT_NEGATIVE)
                .appendLiteral('-')
                .appendValue(java.time.temporal.ChronoField.DAY_OF_MONTH, 1, 2, java.time.format.SignStyle.NOT_NEGATIVE)
                .toFormatter();
            return LocalDate.parse(v, flex);
        } catch (Exception ignore) {}

        var m = java.util.regex.Pattern
            .compile("^(\\d{4})-(\\d{1,2})-(\\d{1,2}).*$")
            .matcher(v);
        if (m.matches()) {
            try {
                return LocalDate.of(
                    Integer.parseInt(m.group(1)),
                    Integer.parseInt(m.group(2)),
                    Integer.parseInt(m.group(3))
                );
            } catch (Exception ignore) {}
        }

        try { return LocalDate.parse(v); } catch (Exception ignore) {}
        return null;
    }
    

     
}
