package com.school.management.repository;
import com.school.management.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {}
