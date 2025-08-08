package com.suriname.image.repository;

import com.suriname.image.entity.Image;
import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByRequest(Request request);
    List<Image> findByRequestRequestIdOrderByCreatedAtAsc(Long requestId);
    void deleteByRequest(Request request);
    
    @Query("SELECT i.imageId, i.fileName, i.fileUrl, i.contentType, i.fileSize, i.createdAt " +
           "FROM Image i WHERE i.request.requestId = :requestId ORDER BY i.createdAt ASC")
    List<Object[]> findImageSummaryByRequestId(@Param("requestId") Long requestId);
}