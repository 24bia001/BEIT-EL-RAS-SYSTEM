package com.school.management.repository;
import com.school.management.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ResultRepository extends JpaRepository<ExamResult, Long> {}
