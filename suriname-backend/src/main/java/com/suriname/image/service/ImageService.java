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