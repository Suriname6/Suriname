package com.suriname.image.service;

import com.suriname.image.entity.Image;
import com.suriname.image.repository.ImageRepository;
import com.suriname.request.entity.Request;
import com.suriname.request.repository.RequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImageService {

    private final ImageRepository imageRepository;
    private final RequestRepository requestRepository;

    public Long uploadImage(Long requestId, MultipartFile file) throws IOException {
        log.info("=== 이미지 업로드 시작 (BLOB 저장) ===");
        log.info("Request ID: {}, File: {}, Size: {} bytes", 
                requestId, file.getOriginalFilename(), file.getSize());
        
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("수리 요청을 찾을 수 없습니다."));

        // 파일 검증
        validateImageFile(file);
        
        // 파일 데이터를 바이트 배열로 읽기
        byte[] imageData = file.getBytes();

        Image image = Image.builder()
                .request(request)
                .fileName(file.getOriginalFilename())
                .fileUrl(null) // BLOB 저장 시에는 URL 불필요
                .imageData(imageData)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        Image savedImage = imageRepository.save(image);
        log.info("=== 이미지 BLOB 저장 완료 ===");
        log.info("Image saved: requestId={}, imageId={}, fileName={}, size={} bytes", 
                requestId, savedImage.getImageId(), savedImage.getFileName(), savedImage.getFileSize());

        return savedImage.getImageId();
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("파일이 비어있습니다.");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB 제한
            throw new RuntimeException("파일 크기는 10MB를 초과할 수 없습니다.");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    public List<Long> uploadMultipleImages(Long requestId, MultipartFile[] files) throws IOException {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("수리 요청을 찾을 수 없습니다."));

        List<Long> uploadedImageIds = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            try {
                validateImageFile(file);

                byte[] imageData = file.getBytes();

                Image image = Image.builder()
                        .request(request)
                        .fileName(file.getOriginalFilename())
                        .fileUrl(null)
                        .imageData(imageData)
                        .contentType(file.getContentType())
                        .fileSize(file.getSize())
                        .build();

                Image savedImage = imageRepository.save(image);
                uploadedImageIds.add(savedImage.getImageId());
                
                log.info("Multiple image saved: requestId={}, imageId={}, fileName={}, size={} bytes", 
                        requestId, savedImage.getImageId(), savedImage.getFileName(), savedImage.getFileSize());

            } catch (Exception e) {
                log.error("개별 파일 업로드 실패: {}, 오류: {}", file.getOriginalFilename(), e.getMessage());
                // 개별 파일 실패는 전체를 중단시키지 않음
            }
        }

        log.info("다중 이미지 업로드 완료: requestId={}, 성공={}/{}", requestId, uploadedImageIds.size(), files.length);
        return uploadedImageIds;
    }
    
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getImagesSummaryByRequestId(Long requestId) {
        List<Object[]> results = imageRepository.findImageSummaryByRequestId(requestId);
        
        return results.stream().map(result -> {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("imageId", result[0]);
            data.put("fileName", result[1]);
            data.put("fileUrl", result[2]);
            data.put("contentType", result[3]);
            data.put("fileSize", result[4]);
            data.put("createdAt", result[5]);
            data.put("requestId", requestId);
            return data;
        }).toList();
    }

    @Transactional(readOnly = true)
    public Image getImageById(Long imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("이미지를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    public void deleteImage(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("이미지를 찾을 수 없습니다."));

        // BLOB 저장 시에는 DB에서만 삭제하면 됨
        imageRepository.delete(image);
        log.info("Image deleted from BLOB: imageId={}, fileName={}", image.getImageId(), image.getFileName());
    }

    public void deleteImagesByRequestId(Long requestId) {
        List<Image> images = imageRepository.findByRequestRequestIdOrderByCreatedAtAsc(requestId);
        
        // BLOB 저장 시에는 DB에서만 삭제하면 됨
        imageRepository.deleteAll(images);
        log.info("All images deleted from BLOB for requestId={}, count={}", requestId, images.size());
    }
}