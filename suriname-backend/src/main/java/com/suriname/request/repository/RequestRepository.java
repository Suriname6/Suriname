package com.suriname.request.repository;

<<<<<<< HEAD:suriname-backend/src/main/java/com/suriname/request/entity/RequestRepository.java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
=======
import com.suriname.request.entity.Request;
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963:suriname-backend/src/main/java/com/suriname/request/repository/RequestRepository.java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    // 접수번호로 Request 조회
    Optional<Request> findByRequestNo(String requestNo);
<<<<<<< HEAD:suriname-backend/src/main/java/com/suriname/request/entity/RequestRepository.java
    
    // 상태별 Request 조회
    Page<Request> findByStatus(Request.Status status, Pageable pageable);
}
=======
}
>>>>>>> 4061aef18b1e5b63022891ef5b6e82873081e963:suriname-backend/src/main/java/com/suriname/request/repository/RequestRepository.java
