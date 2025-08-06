package com.suriname.product.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

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
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductExcelService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ResponseEntity<?> importFromExcel(MultipartFile file) {
        List<Map<String, String>> failures = new ArrayList<>();
        int successCount = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                try {
                    String productBrand = getCellValue(row.getCell(0));  
                    String categoryName = getCellValue(row.getCell(1));       
                    String productName = getCellValue(row.getCell(2));        
                    String modelCode = getCellValue(row.getCell(3));          
                    String memo = getCellValue(row.getCell(4));

                    if (categoryName.isBlank() || productName.isBlank()) {
                        throw new IllegalArgumentException("카테고리명과 제품명은 필수입니다.");
                    }

                    // 카테고리 존재 여부 확인
                    Category category = categoryRepository.findByName(categoryName)
                        .orElseGet(() -> categoryRepository.saveAndFlush(
                            Category.builder()
                                    .name(categoryName)
                                    .parent(null)
                                    .isVisible(true)
                                    .build()
                        ));

                    // 제품 등록
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
                    Map<String, String> fail = new HashMap<>();
                    fail.put("row", String.valueOf(i + 1));
                    fail.put("reason", e.getMessage());
                    failures.add(fail);
                }
            }

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", failures.isEmpty() ? "제품 등록 성공" : "일부 제품 등록 실패",
                "data", Map.of(
                    "successCount", successCount,
                    "failures", failures
                )
            ));

        } catch (Exception e) {
            throw new RuntimeException("엑셀 업로드 실패: " + e.getMessage(), e);
        }
    }

    private String getCellValue(Cell cell) {
        return cell == null ? "" : cell.toString().trim();
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            if (row.getCell(i) != null && !getCellValue(row.getCell(i)).isBlank()) {
                return false;
            }
        }
        return true;
    }
}
