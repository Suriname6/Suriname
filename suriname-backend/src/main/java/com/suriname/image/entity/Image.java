package com.suriname.image.entity;

import com.suriname.request.entity.Request;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "image")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, length = 255)
    private String fileUrl;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public Image(Request request, String fileName, String fileUrl) {
        this.request = request;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
    }
}
