package com.suriname.product.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.product.entity.Product;
import com.suriname.product.repository.ProductRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.io.InputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductExcelService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private static final DataFormatter FMT = new DataFormatter();

    public ResponseEntity<?> importFromExcel(MultipartFile file) throws IOException {
        List<Map<String, String>> failures = new ArrayList<>();
        int successCount = 0;
        int totalCount = 0;

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) { 
            Sheet sheet = workbook.getSheetAt(0);

            final int START_ROW = 1; 
            for (int r = START_ROW; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null || isRowEmpty(row)) continue;

                totalCount++; 

                try {
                    String productBrand = getCellValue(row, 0); // 제조사
                    String categoryName = getCellValue(row, 1); // 제품분류
                    String productName  = getCellValue(row, 2); // 제품명
                    String modelCode    = getCellValue(row, 3); // 모델코드
                    String memo         = getCellValue(row, 4); // 비고

                    if (categoryName.isBlank() || productName.isBlank()) {
                        throw new IllegalArgumentException("카테고리명과 제품명은 필수입니다.");
                    }

                    Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.saveAndFlush(
                            Category.builder()
                                    .name(categoryName)
                                    .parent(null)
                                    .isVisible(true)
                                    .build()
                        ));

                    Product product = Product.builder()
                            .category(category)
                            .productName(productName)
                            .productBrand(productBrand)
                            .modelCode(modelCode)
                            .memo(memo)
                            .isVisible(true)
                            .isDeleted(false)
                            .build();

                    productRepository.save(product);
                    successCount++;

                } catch (Exception e) {
                    failures.add(Map.of(
                        "row", String.valueOf(r + 1),           
                        "reason", e.getMessage() != null ? e.getMessage() : "알 수 없는 오류"
                    ));
                }
            }
        }

        int failureCount = failures.size();

        return ResponseEntity.ok(Map.of(
            "status", 200,
            "message", failureCount == 0 ? "제품 등록 성공" : "일부 제품 등록 실패",
            "data", Map.of(
                "totalCount", totalCount,     
                "successCount", successCount,   
                "failureCount", failureCount,  
                "failures", failures    
            )
        ));
    }

    private String getCellValue(Row row, int idx) {
        if (row == null || idx < 0 || idx >= row.getLastCellNum()) return "";
        Cell cell = row.getCell(idx);
        return cell == null ? "" : FMT.formatCellValue(cell).trim();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && !FMT.formatCellValue(cell).trim().isEmpty()) return false;
        }
        return true;
    }
}
