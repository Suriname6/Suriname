package com.suriname.image.service;

import com.suriname.global.service.S3Service;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ImageService {

    private final ImageRepository imageRepository;
    private final RequestRepository requestRepository;
    private final S3Service s3Service;

    public Long uploadImage(Long requestId, MultipartFile file) throws IOException {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("수리 요청을 찾을 수 없습니다."));

        s3Service.validateFile(file);

        String fileUrl = s3Service.uploadFile(file, "repair-images");

        Image image = Image.builder()
                .request(request)
                .fileName(file.getOriginalFilename())
                .fileUrl(fileUrl)
                .build();

        Image savedImage = imageRepository.save(image);
        log.info("Image saved: requestId={}, imageId={}, fileName={}", 
                requestId, savedImage.getImageId(), savedImage.getFileName());

        return savedImage.getImageId();
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
                s3Service.validateFile(file);

                String fileUrl = s3Service.uploadFile(file, "repair-images");

                Image image = Image.builder()
                        .request(request)
                        .fileName(file.getOriginalFilename())
                        .fileUrl(fileUrl)
                        .build();

                Image savedImage = imageRepository.save(image);
                uploadedImageIds.add(savedImage.getImageId());
                
                log.info("Multiple image saved: requestId={}, imageId={}, fileName={}", 
                        requestId, savedImage.getImageId(), savedImage.getFileName());

            } catch (Exception e) {
                log.error("개별 파일 업로드 실패: {}, 오류: {}", file.getOriginalFilename(), e.getMessage());
                // 개별 파일 실패는 전체를 중단시키지 않음
            }
        }

        log.info("다중 이미지 업로드 완료: requestId={}, 성공={}/{}", requestId, uploadedImageIds.size(), files.length);
        return uploadedImageIds;
    }

    @Transactional(readOnly = true)
    public List<Image> getImagesByRequestId(Long requestId) {
        return imageRepository.findByRequestRequestIdOrderByCreatedAtAsc(requestId);
    }

    public void deleteImage(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("이미지를 찾을 수 없습니다."));

        try {
            s3Service.deleteFile(image.getFileUrl());
        } catch (Exception e) {
            log.warn("S3 파일 삭제 실패: {}", e.getMessage());
        }

        imageRepository.delete(image);
        log.info("Image deleted: imageId={}, fileName={}", image.getImageId(), image.getFileName());
    }

    public void deleteImagesByRequestId(Long requestId) {
        List<Image> images = imageRepository.findByRequestRequestIdOrderByCreatedAtAsc(requestId);
        
        for (Image image : images) {
            try {
                s3Service.deleteFile(image.getFileUrl());
            } catch (Exception e) {
                log.warn("S3 파일 삭제 실패: imageId={}, error={}", image.getImageId(), e.getMessage());
            }
        }
        
        imageRepository.deleteAll(images);
        log.info("All images deleted for requestId={}, count={}", requestId, images.size());
    }
}