package com.school.management.repository;
import com.school.management.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentRepository extends JpaRepository<FeePayment, Long> {}
