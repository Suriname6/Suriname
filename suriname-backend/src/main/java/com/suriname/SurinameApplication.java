package com.suriname;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class SurinameApplication {
	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().filename(".env").load();
		
		SpringApplication.run(SurinameApplication.class, args);
	}
	
}
