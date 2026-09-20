package com.school.management.config;
import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.*;import com.school.management.entity.*;import com.school.management.repository.*;import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class DataSeeder {
 @Bean CommandLineRunner seed(UserRepository u, StudentRepository students, TeacherRepository teachers, PasswordEncoder e){return a->{
  if(u.findByEmail("admin@school.com").isEmpty()) u.save(new User("System Administrator","admin@school.com",e.encode("Admin@123"),User.Role.ADMIN));
  if(students.findByAdmissionNo("ST001").isEmpty()){ Student s=new Student(); s.setAdmissionNo("ST001"); s.setFullName("Demo Student"); s.setEmail("student@beitelras.ac.tz"); s.setClassName("Form 1"); s.setPassword(e.encode("Student@123")); students.save(s); }
  if(teachers.findByEmail("teacher@beitelras.ac.tz").isEmpty()){ Teacher t=new Teacher(); t.setEmployeeNo("T001"); t.setFullName("Demo Teacher"); t.setEmail("teacher@beitelras.ac.tz"); t.setDepartment("Academic"); t.setPassword(e.encode("Teacher@123")); teachers.save(t); }
 };}
}
