package com.school.management.repository;
import com.school.management.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SubjectRepository extends JpaRepository<Subject, Long> {}
