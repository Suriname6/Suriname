package com.suriname.product.service;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import com.suriname.product.entity.Product;
import com.suriname.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductExcelService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public void importFromExcel(MultipartFile file) {
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i < sheet.getPhysicalNumberOfRows(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                String categoryName = getCellValue(row.getCell(0));       
                String productName = getCellValue(row.getCell(1));        
                String productBrand = getCellValue(row.getCell(2));       
                String modelCode = getCellValue(row.getCell(3));          
                String serialNumber = getCellValue(row.getCell(4));       

                // category 필수 처리
                Optional<Category> categoryOpt = categoryRepository.findByName(categoryName);
                if (categoryOpt.isEmpty()) {
                    System.err.println(" 카테고리 '" + categoryName + "' 없음 → 스킵됨 (row " + (i + 1) + ")");
                    continue;
                }

                // serialNumber 없으면 UUID로 생성
                if (serialNumber == null || serialNumber.isBlank()) {
                    serialNumber = "AUTO-" + UUID.randomUUID();
                }

                Product product = Product.builder()
                        .category(categoryOpt.get())
                        .productName(productName)
                        .productBrand(productBrand)
                        .modelCode(modelCode)
                        .serialNumber(serialNumber)
                        .isVisible(true) 
                        .build();

                productRepository.save(product);
            }
        } catch (Exception e) {
            throw new RuntimeException("엑셀 업로드 실패", e);
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
