package com.suriname.customer.service;

import com.suriname.category.entity.Category;
import com.suriname.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.SpreadsheetVersion;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFDataValidation;
import org.openxmlformats.schemas.spreadsheetml.x2006.main.CTDataValidation;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerTemplateService {
    private final CategoryRepository categoryRepository;
    private final org.springframework.core.io.ResourceLoader resourceLoader;

    public byte[] buildCustomerTemplate() throws IOException {
        var res = resourceLoader.getResource("classpath:templates/CustomerListTemplate.xlsx");

        List<String> cats = categoryRepository.findByIsVisibleTrue()
                .stream().map(Category::getName).toList();
        if (cats.isEmpty()) cats = List.of("분류없음");

        try (InputStream in = res.getInputStream();
             Workbook wb = WorkbookFactory.create(in);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {

            Sheet sheet = wb.getSheet("고객등록");
            if (sheet == null) sheet = wb.getSheetAt(0);

            int col = findColumnIndex(sheet.getRow(0), "제품분류");
            if (col < 0) col = 5; 
            
            Sheet oldRef = wb.getSheet("ref");
            if (oldRef != null) wb.removeSheetAt(wb.getSheetIndex(oldRef));
            
            Sheet ref = wb.createSheet("ref");
            wb.setSheetHidden(wb.getSheetIndex(ref), true);
            
            for (int i = 0; i < cats.size(); i++) {
                Row r = ref.createRow(i);
                r.createCell(0).setCellValue(cats.get(i));
            }

            Name nm = wb.getName("CategoryList");
            if (nm == null) nm = wb.createName();
            nm.setNameName("CategoryList");
            nm.setRefersToFormula("'ref'!$A$1:$A$" + cats.size());
            
            SpreadsheetVersion ver = (wb instanceof org.apache.poi.xssf.usermodel.XSSFWorkbook)
                    ? SpreadsheetVersion.EXCEL2007 : SpreadsheetVersion.EXCEL97;
            
            int last = ver.getLastRowIndex(); 
            DataValidationHelper dvh = sheet.getDataValidationHelper();
           
            DataValidationConstraint cst = dvh.createFormulaListConstraint("=CategoryList");
            
            CellRangeAddressList region = new CellRangeAddressList(1, last, col, col);      
            DataValidation dv = dvh.createValidation(cst, region);
            
            dv.setSuppressDropDownArrow(false);
            dv.setShowErrorBox(true);
            
            if (dv instanceof XSSFDataValidation xdv) {
                xdv.setSuppressDropDownArrow(false);  
                xdv.setShowErrorBox(true);
                xdv.setEmptyCellAllowed(true);

                try {
                    var m = XSSFDataValidation.class.getDeclaredMethod("getCtDataValidation");
                    m.setAccessible(true);
                    CTDataValidation ct = (CTDataValidation) m.invoke(xdv);
                    ct.setShowDropDown(false);  
                } catch (Exception ignore) {
                }
            }

            
            dv.setShowErrorBox(true);
            sheet.addValidationData(dv);

            wb.write(bos);
            return bos.toByteArray();
        }
    }

    private int findColumnIndex(Row header, String title) {
        if (header == null) return -1;
        for (int i = 0; i < header.getLastCellNum(); i++) {
            Cell c = header.getCell(i);
            if (c != null && title.equals(c.getStringCellValue().trim())) return i;
        }
        return -1;
    }
}
