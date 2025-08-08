package com.suriname.prediction.repository;

import com.suriname.prediction.entity.ModelMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelMetadataRepository extends JpaRepository<ModelMetadata, Long> {

    // 활성 모델 조회
    List<ModelMetadata> findByIsActiveTrueOrderByTrainingDateDesc();

    // 특정 모델 유형의 활성 모델
    Optional<ModelMetadata> findByModelTypeAndIsActiveTrue(String modelType);

    // 모델명으로 조회
    List<ModelMetadata> findByModelNameOrderByVersionDesc(String modelName);

    // 모델 유형별 최신 버전들
    @Query("SELECT m FROM ModelMetadata m WHERE m.modelType = :modelType " +
           "ORDER BY m.version DESC, m.trainingDate DESC")
    List<ModelMetadata> findLatestVersionsByType(@Param("modelType") String modelType);

    // 최고 성능 모델들
    @Query("SELECT m FROM ModelMetadata m WHERE m.accuracy = " +
           "(SELECT MAX(m2.accuracy) FROM ModelMetadata m2 WHERE m2.modelType = m.modelType) " +
           "ORDER BY m.modelType, m.trainingDate DESC")
    List<ModelMetadata> findBestPerformingModels();

    // 모든 모델 유형 조회
    @Query("SELECT DISTINCT m.modelType FROM ModelMetadata m ORDER BY m.modelType")
    List<String> findDistinctModelTypes();
}