-- 사용자 여정별 더미 데이터

-- 카테고리 데이터
INSERT INTO category (category_id, name, parent_id, is_visible) VALUES 
(1, '가전제품', NULL, true),
(2, '컴퓨터', NULL, true),
(3, '스마트폰', NULL, true);

-- 고객 데이터
INSERT INTO customer (customer_id, name, phone, email, address, birth, status, is_deleted, created_at, updated_at) VALUES 
(1, '김고객', '010-1234-5678', 'customer1@example.com', '서울시 강남구 테헤란로 123', '1985-01-15', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '이고객', '010-2345-6789', 'customer2@example.com', '서울시 서초구 반포대로 456', '1990-05-20', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '박고객', '010-3456-7890', 'customer3@example.com', '경기도 성남시 분당구 정자로 789', '1988-11-10', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, '최고객', '010-4567-8901', 'customer4@example.com', '인천시 남동구 구월로 321', '1992-03-25', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, '정고객', '010-5678-9012', 'customer5@example.com', '부산시 해운대구 센텀로 654', '1987-07-18', 'ACTIVE', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 제품 데이터
INSERT INTO product (product_id, product_name, product_brand, model_code, serial_number, category_id, is_visible, created_at, updated_at) VALUES 
(1, 'LG 냉장고', 'LG전자', 'RF-001', 'LG2024001', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '삼성 세탁기', '삼성전자', 'WM-002', 'SS2024002', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '맥북 프로', 'Apple', 'MBP-003', 'AP2024003', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, '갤럭시 S24', '삼성전자', 'SM-004', 'SS2024004', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, '아이폰 15', 'Apple', 'IP-005', 'AP2024005', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 고객-제품 연결 데이터
INSERT INTO customer_product (customer_product_id, customer_id, product_id, created_at, updated_at) VALUES 
(1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 3, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 4, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 직원 데이터 (패스워드는 'password' 해시)
INSERT INTO employee (employee_id, name, login_id, password, email, phone, birth, role, status, created_at, updated_at) VALUES 
(1, '관리자', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0MYKx0Rur4dHFxOzS2', 'admin@suriname.com', '010-0000-0001', '1980-01-01', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '김기사', 'engineer1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0MYKx0Rur4dHFxOzS2', 'engineer1@suriname.com', '010-0000-0002', '1985-03-15', 'ENGINEER', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, '이직원', 'staff1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM0MYKx0Rur4dHFxOzS2', 'staff1@suriname.com', '010-0000-0003', '1990-07-20', 'STAFF', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 사용자 여정별 A/S 접수 데이터
INSERT INTO request (request_id, request_no, customer_id, customer_product_id, employee_id, content, input_product_name, input_brand, input_model, status, created_at) VALUES 
-- 1. 접수 단계 - 새로 들어온 요청
(1, 'REQ-2024-001', 1, 1, 2, '냉장고에서 이상한 소리가 납니다', 'LG 냉장고', 'LG전자', 'RF-001', 'RECEIVED', CURRENT_TIMESTAMP),
-- 2. 수리 중 - 현재 수리 진행중
(2, 'REQ-2024-002', 2, 2, 2, '세탁기 배수가 잘 안됩니다', '삼성 세탁기', '삼성전자', 'WM-002', 'REPAIRING', CURRENT_TIMESTAMP),
-- 3. 배송 대기 - 수리 완료, 배송 대기
(3, 'REQ-2024-003', 3, 3, 2, '맥북 화면이 깜빡입니다', '맥북 프로', 'Apple', 'MBP-003', 'WAITING_FOR_DELIVERY', CURRENT_TIMESTAMP),
-- 4. 배송 중 - 배송 진행중
(4, 'REQ-2024-004', 4, 4, 2, '갤럭시 배터리가 빨리 닳습니다', '갤럭시 S24', '삼성전자', 'SM-004', 'WAITING_FOR_DELIVERY', CURRENT_TIMESTAMP),
-- 5. 완료 단계 - 모든 과정 완료
(5, 'REQ-2024-005', 5, 5, 2, '아이폰 터치가 안됩니다', '아이폰 15', 'Apple', 'IP-005', 'COMPLETED', CURRENT_TIMESTAMP);

-- 사용자 여정별 배송 데이터
INSERT INTO delivery (delivery_id, request_id, name, phone, zipcode, address, tracking_no, carrier_name, status, created_at, updated_at, completed_date) VALUES 
-- 배송 대기 상태
(1, 3, '박고객', '010-3456-7890', '13561', '경기도 성남시 분당구 정자로 789', NULL, NULL, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
-- 배송 중 상태
(2, 4, '최고객', '010-4567-8901', '21345', '인천시 남동구 구월로 321', '4567890123', '로젠택배', 'SHIPPED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),
-- 배송 완료 상태
(3, 5, '정고객', '010-5678-9012', '48058', '부산시 해운대구 센텀로 654', '5678901234', 'CJ대한통운', 'DELIVERED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, DATEADD('DAY', -2, CURRENT_TIMESTAMP));

-- 완료 처리 데이터 (배송 완료된 것만)
INSERT INTO completion (completion_id, request_id, delivery_id, completed_by, completion_type, completion_notes, customer_received, satisfaction_requested, created_at, updated_at, received_date, satisfaction_sent_date) VALUES 
-- 고객 수령 확인됨, 만족도 조사 요청됨
(1, 5, 3, 2, 'REPAIR_COMPLETED', '터치 센서 교체 완료. 정상 작동 확인됨.', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, DATEADD('DAY', -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP);

-- 만족도 조사 데이터
INSERT INTO satisfaction (satisfaction_id, request_id, customer_id, completion_id, rating, overall_rating, service_quality_rating, response_time_rating, delivery_rating, staff_kindness_rating, recommend_to_others, feedback, survey_method, ip_address, created_at, submitted_at) VALUES 
(1, 5, 5, 1, 5, 5, 5, 4, 5, 5, true, '매우 만족합니다. 빠른 수리와 친절한 서비스 감사합니다!', 'ONLINE', '192.168.1.100', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 결제 데이터 
INSERT INTO payment (payment_id, request_id, cost, merchant_uid, bank, account, status, memo, confirmed_at) VALUES 
-- 결제 완료
(1, 1, 150000, 'merchant_001', '국민은행', '123-456-789', 'SUCCESS', '냉장고 수리비', DATEADD('DAY', -1, CURRENT_TIMESTAMP)),
(2, 2, 120000, 'merchant_002', '신한은행', '234-567-890', 'SUCCESS', '세탁기 수리비', DATEADD('DAY', -2, CURRENT_TIMESTAMP)),
(3, 3, 200000, 'merchant_003', '우리은행', '345-678-901', 'SUCCESS', '맥북 수리비', DATEADD('DAY', -3, CURRENT_TIMESTAMP)),
-- 결제 대기
(4, 4, 80000, 'merchant_004', 'KB국민은행', '456-789-012', 'PENDING', '갤럭시 배터리 교체비', NULL),
-- 결제 완료
(5, 5, 100000, 'merchant_005', '하나은행', '567-890-123', 'SUCCESS', '아이폰 터치센서 교체비', DATEADD('DAY', -4, CURRENT_TIMESTAMP));