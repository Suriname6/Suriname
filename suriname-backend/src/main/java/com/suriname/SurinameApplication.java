package com.suriname;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SurinameApplication {
	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.configure().filename(".env.properties").load();
		System.setProperty("DB_URL", dotenv.get("DB_URL"));
		System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("PORTONE_SECRET_KEY", dotenv.get("PORTONE_SECRET_KEY"));
		SpringApplication.run(SurinameApplication.class, args);
	}

}

