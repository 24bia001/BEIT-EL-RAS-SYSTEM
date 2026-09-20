package com.school.management.repository;
import com.school.management.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {}
