package com.suriname.image.controller;

import com.suriname.image.entity.Image;
import com.suriname.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/upload/{requestId}")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @PathVariable Long requestId,
            @RequestParam("file") MultipartFile file) {
        log.info("=== 이미지 업로드 요청 수신 ===");
        log.info("Request ID: {}", requestId);
        log.info("File name: {}", file.getOriginalFilename());
        log.info("File size: {} bytes", file.getSize());
        log.info("Content type: {}", file.getContentType());
        
        try {
            Long imageId = imageService.uploadImage(requestId, file);
            log.info("=== 이미지 업로드 성공 ===");
            log.info("Generated Image ID: {}", imageId);
            
            return ResponseEntity.ok(Map.of(
                    "status", 201,
                    "data", Map.of("imageId", imageId)
            ));
        } catch (IOException e) {
            log.error("=== 파일 I/O 업로드 실패 ===");
            log.error("Request ID: {}, File: {}", requestId, file.getOriginalFilename());
            log.error("I/O 오류: {}", e.getMessage());
            log.error("스택 트레이스: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "파일 업로드에 실패했습니다: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("=== 이미지 업로드 실패 ===");
            log.error("Request ID: {}, File: {}", requestId, file.getOriginalFilename());
            log.error("오류 타입: {}", e.getClass().getSimpleName());
            log.error("오류 메시지: {}", e.getMessage());
            log.error("스택 트레이스: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/upload/multiple/{requestId}")
    public ResponseEntity<Map<String, Object>> uploadMultipleImages(
            @PathVariable Long requestId,
            @RequestParam("files") MultipartFile[] files) {
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", 400,
                        "message", "업로드할 파일이 없습니다."
                ));
            }

            List<Long> imageIds = imageService.uploadMultipleImages(requestId, files);
            return ResponseEntity.ok(Map.of(
                    "status", 201,
                    "data", Map.of(
                            "imageIds", imageIds,
                            "uploadedCount", imageIds.size(),
                            "totalCount", files.length
                    )
            ));
        } catch (IOException e) {
            log.error("다중 파일 업로드 실패: requestId={}, error={}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "파일 업로드에 실패했습니다: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("다중 이미지 업로드 실패: requestId={}, error={}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<Map<String, Object>> getImagesByRequestId(@PathVariable Long requestId) {
        try {
            List<Map<String, Object>> imageData = imageService.getImagesSummaryByRequestId(requestId);
            
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", imageData
            ));
        } catch (Exception e) {
            log.error("이미지 조회 실패: requestId={}, error={}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<Map<String, Object>> deleteImage(@PathVariable Long imageId) {
        try {
            imageService.deleteImage(imageId);
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "이미지가 삭제되었습니다."
            ));
        } catch (Exception e) {
            log.error("이미지 삭제 실패: imageId={}, error={}", imageId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/request/{requestId}")
    public ResponseEntity<Map<String, Object>> deleteImagesByRequestId(@PathVariable Long requestId) {
        try {
            imageService.deleteImagesByRequestId(requestId);
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "수리 요청의 모든 이미지가 삭제되었습니다."
            ));
        } catch (Exception e) {
            log.error("이미지 일괄 삭제 실패: requestId={}, error={}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/view/{imageId}")
    public ResponseEntity<byte[]> getImageBlob(@PathVariable Long imageId) {
        try {
            Image image = imageService.getImageById(imageId);
            
            if (image.getImageData() == null) {
                log.warn("이미지 데이터가 없습니다: imageId={}", imageId);
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(image.getContentType()));
            headers.setContentLength(image.getFileSize());
            headers.setContentDispositionFormData("inline", image.getFileName());

            log.info("이미지 BLOB 조회 성공: imageId={}, fileName={}, contentType={}, size={}bytes", 
                    imageId, image.getFileName(), image.getContentType(), image.getFileSize());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(image.getImageData());
                    
        } catch (Exception e) {
            log.error("이미지 BLOB 조회 실패: imageId={}, error={}", imageId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/debug/existing")
    public ResponseEntity<Map<String, Object>> debugExistingImages() {
        try {
            List<Image> allImages = imageService.getAllImages();
            List<Map<String, Object>> imageInfos = allImages.stream().map(image -> {
                Map<String, Object> info = new java.util.HashMap<>();
                info.put("imageId", image.getImageId());
                info.put("fileName", image.getFileName());
                info.put("requestId", image.getRequest().getRequestId());
                info.put("createdAt", image.getCreatedAt());
                info.put("fileSize", image.getFileSize());
                return info;
            }).toList();
            
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "현재 DB에 저장된 모든 이미지 정보",
                    "data", imageInfos,
                    "total", allImages.size()
            ));
        } catch (Exception e) {
            log.error("기존 이미지 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", e.getMessage()
            ));
        }
    }
}