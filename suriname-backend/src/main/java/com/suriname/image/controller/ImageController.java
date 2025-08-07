package com.suriname.image.controller;

import com.suriname.image.entity.Image;
import com.suriname.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
        try {
            Long imageId = imageService.uploadImage(requestId, file);
            return ResponseEntity.ok(Map.of(
                    "status", 201,
                    "data", Map.of("imageId", imageId)
            ));
        } catch (IOException e) {
            log.error("파일 업로드 실패: requestId={}, error={}", requestId, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "status", 400,
                    "message", "파일 업로드에 실패했습니다: " + e.getMessage()
            ));
        } catch (Exception e) {
            log.error("이미지 업로드 실패: requestId={}, error={}", requestId, e.getMessage());
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
            List<Image> images = imageService.getImagesByRequestId(requestId);
            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", images
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
}