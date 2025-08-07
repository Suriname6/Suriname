package com.suriname.image.repository;

import com.suriname.image.entity.Image;
import com.suriname.request.entity.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByRequest(Request request);
    List<Image> findByRequestRequestIdOrderByCreatedAtAsc(Long requestId);
    void deleteByRequest(Request request);
}