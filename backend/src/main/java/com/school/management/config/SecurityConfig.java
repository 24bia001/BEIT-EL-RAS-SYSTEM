package com.school.management.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import java.util.*;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

    @Bean
    SecurityFilterChain filter(HttpSecurity http)throws Exception{
        http
            .csrf(c->c.disable())
            .cors(c->c.configurationSource(request->{
                CorsConfiguration x=new CorsConfiguration();
                x.setAllowedOriginPatterns(List.of("http://localhost:*","http://127.0.0.1:*"));
                x.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
                x.setAllowedHeaders(List.of("*"));
                x.setAllowCredentials(true);
                return x;
            }))
            .authorizeHttpRequests(a->a.anyRequest().permitAll());
        return http.build();
    }
}
