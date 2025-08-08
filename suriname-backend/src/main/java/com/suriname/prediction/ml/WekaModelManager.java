package com.suriname.prediction.ml;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import weka.classifiers.Classifier;
import weka.classifiers.functions.LinearRegression;
import weka.classifiers.trees.RandomForest;
import weka.core.Attribute;
import weka.core.DenseInstance;
import weka.core.Instance;
import weka.core.Instances;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * Weka 기반 ML 모델 관리자
 */
@Component
@Slf4j
public class WekaModelManager {

    private Classifier repairTimeModel;
    private Classifier deliveryRiskModel;
    private Classifier customerRetentionModel;
    private Instances repairTimeDataset;
    private Instances deliveryRiskDataset;
    private Instances customerRetentionDataset;

    public WekaModelManager() {
        initializeModels();
    }

    /**
     * 모델 초기화
     */
    private void initializeModels() {
        try {
            log.info("Weka ML 모델 초기화 시작");
            
            // A/S 처리시간 예측 모델
            initializeRepairTimeModel();
            
            // 배송 지연 위험도 예측 모델
            initializeDeliveryRiskModel();
            
            // 고객 재방문 예측 모델
            initializeCustomerRetentionModel();
            
            log.info("Weka ML 모델 초기화 완료");
        } catch (Exception e) {
            log.error("ML 모델 초기화 실패", e);
        }
    }

    /**
     * A/S 처리시간 예측 모델 초기화
     */
    private void initializeRepairTimeModel() throws Exception {
        // 속성 정의
        ArrayList<Attribute> attributes = new ArrayList<>();
        
        // 카테고리별 속성 (TV, 냉장고, 세탁기, 에어컨, 기타)
        ArrayList<String> categoryValues = new ArrayList<>(Arrays.asList(
            "TV", "냉장고", "세탁기", "에어컨", "기타"
        ));
        attributes.add(new Attribute("product_category", categoryValues));
        
        // 경험도별 속성 (BEGINNER, INTERMEDIATE, EXPERT)
        ArrayList<String> experienceValues = new ArrayList<>(Arrays.asList(
            "BEGINNER", "INTERMEDIATE", "EXPERT"
        ));
        attributes.add(new Attribute("employee_experience", experienceValues));
        
        // 워크로드 (숫자형)
        attributes.add(new Attribute("current_workload"));
        
        // 문제 복잡도 (1-5)
        attributes.add(new Attribute("issue_complexity"));
        
        // 부품 가용성 (1-5)
        attributes.add(new Attribute("parts_availability"));
        
        // 목표 변수: 처리시간 (일)
        attributes.add(new Attribute("repair_days"));

        // 데이터셋 생성
        repairTimeDataset = new Instances("RepairTimeDataset", attributes, 0);
        repairTimeDataset.setClassIndex(repairTimeDataset.numAttributes() - 1);

        // 샘플 데이터로 모델 훈련
        generateRepairTimeSampleData();
        
        // Random Forest 모델 생성 및 훈련
        repairTimeModel = new RandomForest();
        ((RandomForest) repairTimeModel).setNumIterations(100);
        repairTimeModel.buildClassifier(repairTimeDataset);
        
        log.info("A/S 처리시간 예측 모델 훈련 완료 - 샘플 데이터: {} 건", repairTimeDataset.numInstances());
    }

    /**
     * 배송 지연 위험도 예측 모델 초기화
     */
    private void initializeDeliveryRiskModel() throws Exception {
        ArrayList<Attribute> attributes = new ArrayList<>();
        
        // 배송 거리 (km)
        attributes.add(new Attribute("delivery_distance"));
        
        // 날씨 조건 (1-5, 5가 최악)
        attributes.add(new Attribute("weather_condition"));
        
        // 교통 상황 (1-5, 5가 최악)
        attributes.add(new Attribute("traffic_condition"));
        
        // 배송 업체 신뢰도 (1-5)
        attributes.add(new Attribute("carrier_reliability"));
        
        // 제품 무게 (kg)
        attributes.add(new Attribute("product_weight"));
        
        // 목표 변수: 지연 위험도 (0-1)
        attributes.add(new Attribute("delay_risk"));

        deliveryRiskDataset = new Instances("DeliveryRiskDataset", attributes, 0);
        deliveryRiskDataset.setClassIndex(deliveryRiskDataset.numAttributes() - 1);

        generateDeliveryRiskSampleData();
        
        deliveryRiskModel = new LinearRegression();
        deliveryRiskModel.buildClassifier(deliveryRiskDataset);
        
        log.info("배송 지연 위험도 예측 모델 훈련 완료 - 샘플 데이터: {} 건", deliveryRiskDataset.numInstances());
    }

    /**
     * 고객 재방문 예측 모델 초기화
     */
    private void initializeCustomerRetentionModel() throws Exception {
        ArrayList<Attribute> attributes = new ArrayList<>();
        
        // 고객 나이
        attributes.add(new Attribute("customer_age"));
        
        // 과거 서비스 횟수
        attributes.add(new Attribute("previous_services"));
        
        // 만족도 점수 (1-5)
        attributes.add(new Attribute("satisfaction_score"));
        
        // 마지막 서비스 후 경과 일수
        attributes.add(new Attribute("days_since_last_service"));
        
        // 서비스 비용 총액
        attributes.add(new Attribute("total_service_cost"));
        
        // 목표 변수: 재방문 확률 (0-1)
        attributes.add(new Attribute("return_probability"));

        customerRetentionDataset = new Instances("CustomerRetentionDataset", attributes, 0);
        customerRetentionDataset.setClassIndex(customerRetentionDataset.numAttributes() - 1);

        generateCustomerRetentionSampleData();
        
        customerRetentionModel = new RandomForest();
        ((RandomForest) customerRetentionModel).setNumIterations(50);
        customerRetentionModel.buildClassifier(customerRetentionDataset);
        
        log.info("고객 재방문 예측 모델 훈련 완료 - 샘플 데이터: {} 건", customerRetentionDataset.numInstances());
    }

    /**
     * A/S 처리시간 예측
     */
    public double predictRepairTime(String productCategory, String employeeExperience, 
                                   int currentWorkload, int issueComplexity, int partsAvailability) {
        try {
            Instance instance = new DenseInstance(repairTimeDataset.numAttributes());
            instance.setDataset(repairTimeDataset);
            
            instance.setValue(0, productCategory);
            instance.setValue(1, employeeExperience);
            instance.setValue(2, currentWorkload);
            instance.setValue(3, issueComplexity);
            instance.setValue(4, partsAvailability);
            
            double prediction = repairTimeModel.classifyInstance(instance);
            return Math.max(1.0, Math.min(prediction, 30.0)); // 1-30일 범위
        } catch (Exception e) {
            log.error("A/S 처리시간 예측 실패", e);
            return 3.0; // 기본값
        }
    }

    /**
     * 배송 지연 위험도 예측
     */
    public double predictDeliveryRisk(double deliveryDistance, int weatherCondition, 
                                     int trafficCondition, int carrierReliability, double productWeight) {
        try {
            Instance instance = new DenseInstance(deliveryRiskDataset.numAttributes());
            instance.setDataset(deliveryRiskDataset);
            
            instance.setValue(0, deliveryDistance);
            instance.setValue(1, weatherCondition);
            instance.setValue(2, trafficCondition);
            instance.setValue(3, carrierReliability);
            instance.setValue(4, productWeight);
            
            double prediction = deliveryRiskModel.classifyInstance(instance);
            return Math.max(0.0, Math.min(prediction, 1.0)); // 0-1 범위
        } catch (Exception e) {
            log.error("배송 지연 위험도 예측 실패", e);
            return 0.3; // 기본값
        }
    }

    /**
     * 고객 재방문 확률 예측
     */
    public double predictCustomerRetention(int customerAge, int previousServices, 
                                          int satisfactionScore, int daysSinceLastService, double totalServiceCost) {
        try {
            Instance instance = new DenseInstance(customerRetentionDataset.numAttributes());
            instance.setDataset(customerRetentionDataset);
            
            instance.setValue(0, customerAge);
            instance.setValue(1, previousServices);
            instance.setValue(2, satisfactionScore);
            instance.setValue(3, daysSinceLastService);
            instance.setValue(4, totalServiceCost);
            
            double prediction = customerRetentionModel.classifyInstance(instance);
            return Math.max(0.0, Math.min(prediction, 1.0)); // 0-1 범위
        } catch (Exception e) {
            log.error("고객 재방문 확률 예측 실패", e);
            return 0.5; // 기본값
        }
    }

    /**
     * A/S 처리시간 샘플 데이터 생성
     */
    private void generateRepairTimeSampleData() {
        String[] categories = {"TV", "냉장고", "세탁기", "에어컨", "기타"};
        String[] experiences = {"BEGINNER", "INTERMEDIATE", "EXPERT"};
        
        for (int i = 0; i < 200; i++) {
            Instance instance = new DenseInstance(repairTimeDataset.numAttributes());
            instance.setDataset(repairTimeDataset);
            
            String category = categories[i % categories.length];
            String experience = experiences[i % experiences.length];
            int workload = 5 + (i % 20);
            int complexity = 1 + (i % 5);
            int availability = 1 + (i % 5);
            
            // 처리시간 계산 (복잡한 로직 기반)
            double repairTime = 2.0;
            if ("TV".equals(category)) repairTime += 1.0;
            if ("냉장고".equals(category)) repairTime += 2.0;
            if ("BEGINNER".equals(experience)) repairTime += 1.5;
            if ("EXPERT".equals(experience)) repairTime -= 1.0;
            repairTime += complexity * 0.5;
            repairTime += (5 - availability) * 0.3;
            repairTime += workload * 0.1;
            repairTime += Math.random() * 2 - 1; // 노이즈
            
            instance.setValue(0, category);
            instance.setValue(1, experience);
            instance.setValue(2, workload);
            instance.setValue(3, complexity);
            instance.setValue(4, availability);
            instance.setValue(5, Math.max(1, repairTime));
            
            repairTimeDataset.add(instance);
        }
    }

    /**
     * 배송 지연 위험도 샘플 데이터 생성
     */
    private void generateDeliveryRiskSampleData() {
        for (int i = 0; i < 150; i++) {
            Instance instance = new DenseInstance(deliveryRiskDataset.numAttributes());
            instance.setDataset(deliveryRiskDataset);
            
            double distance = 10 + Math.random() * 100;
            int weather = 1 + (i % 5);
            int traffic = 1 + (i % 5);
            int reliability = 1 + (i % 5);
            double weight = 1 + Math.random() * 50;
            
            // 위험도 계산
            double risk = 0.1;
            risk += distance / 500.0;
            risk += weather / 10.0;
            risk += traffic / 10.0;
            risk += (6 - reliability) / 10.0;
            risk += weight / 200.0;
            risk += Math.random() * 0.2 - 0.1; // 노이즈
            
            instance.setValue(0, distance);
            instance.setValue(1, weather);
            instance.setValue(2, traffic);
            instance.setValue(3, reliability);
            instance.setValue(4, weight);
            instance.setValue(5, Math.max(0, Math.min(1, risk)));
            
            deliveryRiskDataset.add(instance);
        }
    }

    /**
     * 고객 재방문 확률 샘플 데이터 생성
     */
    private void generateCustomerRetentionSampleData() {
        for (int i = 0; i < 180; i++) {
            Instance instance = new DenseInstance(customerRetentionDataset.numAttributes());
            instance.setDataset(customerRetentionDataset);
            
            int age = 25 + (i % 50);
            int services = i % 10;
            int satisfaction = 1 + (i % 5);
            int days = 30 + (i % 300);
            double cost = 50000 + Math.random() * 500000;
            
            // 재방문 확률 계산
            double probability = 0.3;
            probability += services * 0.05;
            probability += satisfaction * 0.15;
            probability -= days / 1000.0;
            if (cost > 200000) probability += 0.1;
            probability += Math.random() * 0.2 - 0.1; // 노이즈
            
            instance.setValue(0, age);
            instance.setValue(1, services);
            instance.setValue(2, satisfaction);
            instance.setValue(3, days);
            instance.setValue(4, cost);
            instance.setValue(5, Math.max(0, Math.min(1, probability)));
            
            customerRetentionDataset.add(instance);
        }
    }

    /**
     * 모델 정확도 계산
     */
    public double getModelAccuracy(String modelType) {
        try {
            switch (modelType.toUpperCase()) {
                case "REPAIR_TIME":
                    return calculateAccuracy(repairTimeModel, repairTimeDataset);
                case "DELIVERY_RISK":
                    return calculateAccuracy(deliveryRiskModel, deliveryRiskDataset);
                case "CUSTOMER_RETENTION":
                    return calculateAccuracy(customerRetentionModel, customerRetentionDataset);
                default:
                    return 0.75; // 기본값
            }
        } catch (Exception e) {
            log.error("모델 정확도 계산 실패: {}", modelType, e);
            return 0.75;
        }
    }

    /**
     * 정확도 계산 헬퍼 메서드
     */
    private double calculateAccuracy(Classifier model, Instances dataset) throws Exception {
        int correct = 0;
        int total = dataset.numInstances();
        
        for (int i = 0; i < total; i++) {
            Instance instance = dataset.instance(i);
            double predicted = model.classifyInstance(instance);
            double actual = instance.classValue();
            
            // 회귀 문제의 경우 상대 오차 10% 이내면 정확하다고 가정
            double relativeError = Math.abs(predicted - actual) / Math.max(actual, 1.0);
            if (relativeError <= 0.1) {
                correct++;
            }
        }
        
        return (double) correct / total;
    }
}