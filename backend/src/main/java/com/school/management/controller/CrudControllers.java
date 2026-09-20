package com.school.management.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.*;
import jakarta.validation.Valid;
import com.school.management.entity.*;
import com.school.management.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;

@RestController
@RequestMapping("/api/students")
class StudentController {
    private final StudentRepository r; private final PasswordEncoder enc;
    StudentController(StudentRepository r, PasswordEncoder enc){this.r=r;this.enc=enc;}

    @GetMapping List<Student> all(){return r.findAll();}
    @GetMapping("/{id}") Student one(@PathVariable Long id){return r.findById(id).orElseThrow();}
    @PostMapping ResponseEntity<Student> add(@Valid @RequestBody Student s){
        if(s.getPassword()==null || s.getPassword().isBlank()) return ResponseEntity.badRequest().build();
        s.setPassword(enc.encode(s.getPassword()));
        return ResponseEntity.status(201).body(r.save(s));
    }
    @PutMapping("/{id}") Student update(@PathVariable Long id,@Valid @RequestBody Student s){
        Student current=r.findById(id).orElseThrow();
        current.setAdmissionNo(s.getAdmissionNo()); current.setFullName(s.getFullName()); current.setEmail(s.getEmail());
        current.setPhone(s.getPhone()); current.setGender(s.getGender()); current.setAddress(s.getAddress());
        current.setParentName(s.getParentName()); current.setParentPhone(s.getParentPhone());
        current.setDateOfBirth(s.getDateOfBirth()); current.setClassName(s.getClassName()); current.setPhotoUrl(s.getPhotoUrl());
        if(s.getPassword()!=null && !s.getPassword().isBlank()) current.setPassword(enc.encode(s.getPassword()));
        return r.save(current);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> delete(@PathVariable Long id){r.deleteById(id);return ResponseEntity.noContent().build();}
}

@RestController
@RequestMapping("/api/teachers")
class TeacherController {
    private final TeacherRepository r; private final PasswordEncoder enc;
    TeacherController(TeacherRepository r, PasswordEncoder enc){this.r=r;this.enc=enc;}
    @GetMapping List<Teacher> all(){return r.findAll();}
    @PostMapping ResponseEntity<Teacher> add(@Valid @RequestBody Teacher x){
        if(x.getPassword()==null || x.getPassword().isBlank()) return ResponseEntity.badRequest().build();
        x.setPassword(enc.encode(x.getPassword()));
        return ResponseEntity.status(201).body(r.save(x));
    }
    @PutMapping("/{id}") Teacher update(@PathVariable Long id,@Valid @RequestBody Teacher x){
        Teacher c=r.findById(id).orElseThrow();
        c.setEmployeeNo(x.getEmployeeNo()); c.setFullName(x.getFullName()); c.setEmail(x.getEmail());
        c.setPhone(x.getPhone()); c.setDepartment(x.getDepartment()); c.setSpecialization(x.getSpecialization());
        if(x.getPassword()!=null && !x.getPassword().isBlank()) c.setPassword(enc.encode(x.getPassword()));
        return r.save(c);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id){r.deleteById(id);return ResponseEntity.noContent().build();}
}

@RestController
@RequestMapping("/api/subjects")
class SubjectController {
    private final SubjectRepository r;
    SubjectController(SubjectRepository r){this.r=r;}
    @GetMapping List<Subject> all(){return r.findAll();}
    @PostMapping ResponseEntity<Subject> add(@Valid @RequestBody Subject x){return ResponseEntity.status(201).body(r.save(x));}
    @PutMapping("/{id}") Subject update(@PathVariable Long id,@Valid @RequestBody Subject x){
        Subject c=r.findById(id).orElseThrow(); c.setCode(x.getCode()); c.setName(x.getName()); c.setDescription(x.getDescription()); return r.save(c);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id){r.deleteById(id);return ResponseEntity.noContent().build();}
}

@RestController
@RequestMapping("/api/attendance")
class AttendanceController {
    private final AttendanceRepository r;
    AttendanceController(AttendanceRepository r){this.r=r;}
    @GetMapping List<Attendance> all(){return r.findAll();}
    @PostMapping ResponseEntity<Attendance> add(@RequestBody Attendance x){return ResponseEntity.status(201).body(r.save(x));}
    @PutMapping("/{id}") Attendance update(@PathVariable Long id,@RequestBody Attendance x){
        Attendance c=r.findById(id).orElseThrow(); c.setStudentId(x.getStudentId()); c.setDate(x.getDate()); c.setStatus(x.getStatus()); c.setRemarks(x.getRemarks()); return r.save(c);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id, @RequestHeader(value="X-Role", required=false) String role){
        if("STUDENT".equalsIgnoreCase(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        r.deleteById(id); return ResponseEntity.noContent().build();
    }
}

@RestController
@RequestMapping("/api/results")
class ResultController {
    private final ResultRepository r;
    ResultController(ResultRepository r){this.r=r;}
    @GetMapping List<ExamResult> all(){return r.findAll();}
    @PostMapping ResponseEntity<ExamResult> add(@RequestBody ExamResult x){
        if(x.getMarks()==null || x.getMarks()<0 || x.getMarks()>100) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(201).body(r.save(withGrade(x)));
    }
    @PutMapping("/{id}") ExamResult update(@PathVariable Long id,@RequestBody ExamResult x){
        ExamResult c=r.findById(id).orElseThrow();
        if(x.getMarks()==null || x.getMarks()<0 || x.getMarks()>100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Marks must be between 0 and 100");
        c.setStudentId(x.getStudentId()); c.setSubject(x.getSubject()); c.setMarks(x.getMarks()); return r.save(withGrade(c));
    }
    private ExamResult withGrade(ExamResult x){
        if(x.getMarks()!=null)x.setGrade(x.getMarks()>=90?"A":x.getMarks()>=70?"B":x.getMarks()>=50?"C":x.getMarks()>=30?"D":"F");
        return x;
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id, @RequestHeader(value="X-Role", required=false) String role){
        if("STUDENT".equalsIgnoreCase(role)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        r.deleteById(id); return ResponseEntity.noContent().build();
    }
}

@RestController
@RequestMapping("/api/payments")
class PaymentController {
    private final PaymentRepository r;
    PaymentController(PaymentRepository r){this.r=r;}
    @GetMapping List<FeePayment> all(){return r.findAll();}
    @PostMapping ResponseEntity<FeePayment> add(@RequestBody FeePayment x){return ResponseEntity.status(201).body(r.save(x));}
    @PutMapping("/{id}") FeePayment update(@PathVariable Long id,@RequestBody FeePayment x){
        FeePayment c=r.findById(id).orElseThrow(); c.setStudentId(x.getStudentId()); c.setAmount(x.getAmount()); c.setReference(x.getReference()); c.setMethod(x.getMethod()); return r.save(c);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id){r.deleteById(id);return ResponseEntity.noContent().build();}
}

@RestController
@RequestMapping("/api/announcements")
class AnnouncementController {
    private final AnnouncementRepository r;
    AnnouncementController(AnnouncementRepository r){this.r=r;}
    @GetMapping List<Announcement> all(){return r.findAll();}
    @PostMapping ResponseEntity<Announcement> add(@RequestBody Announcement x){return ResponseEntity.status(201).body(r.save(x));}
    @PutMapping("/{id}") Announcement update(@PathVariable Long id,@RequestBody Announcement x){
        Announcement c=r.findById(id).orElseThrow(); c.setTitle(x.getTitle()); c.setMessage(x.getMessage()); c.setAudience(x.getAudience()); return r.save(c);
    }
    @DeleteMapping("/{id}") ResponseEntity<Void> del(@PathVariable Long id){r.deleteById(id);return ResponseEntity.noContent().build();}
}

@RestController
@RequestMapping("/api/auth")
class AuthController {
    private final UserRepository r; private final PasswordEncoder enc; private final StudentRepository studentRepository; private final TeacherRepository teacherRepository;
    AuthController(UserRepository r, PasswordEncoder enc, StudentRepository studentRepository, TeacherRepository teacherRepository){this.r=r;this.enc=enc;this.studentRepository=studentRepository;this.teacherRepository=teacherRepository;}

    @PostMapping("/register")
    ResponseEntity<?> register(@Valid @RequestBody User u){
        if(r.findByEmail(u.getEmail()).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","Email already exists"));
        u.setPassword(enc.encode(u.getPassword()));
        return ResponseEntity.status(201).body(r.save(u));
    }

    @PostMapping("/login")
    ResponseEntity<?> login(@RequestBody Map<String,String> p){
        String role=p.getOrDefault("role","").trim().toUpperCase();
        String identifier=p.getOrDefault("identifier","").trim();
        String password=p.getOrDefault("password","");
        if("ADMIN".equals(role)){
            Optional<User> found=r.findByEmail(identifier);
            if(found.isEmpty() || found.get().getRole()!=User.Role.ADMIN || !enc.matches(password,found.get().getPassword()))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid administrator email or password"));
            User u=found.get();
            return ResponseEntity.ok(Map.of("id",u.getId(),"name",u.getFullName(),"role",u.getRole(),"email",u.getEmail()));
        }
        if("TEACHER".equals(role)){
            Optional<Teacher> found=teacherRepository.findByEmail(identifier);
            if(found.isEmpty() || found.get().getPassword()==null || !enc.matches(password,found.get().getPassword()))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid teacher email or password"));
            Teacher t=found.get();
            return ResponseEntity.ok(Map.of("id",t.getId(),"name",t.getFullName(),"role","TEACHER","email",t.getEmail(),"employeeNo",t.getEmployeeNo()));
        }
        if("STUDENT".equals(role)){
            Optional<Student> found=studentRepository.findByAdmissionNo(identifier);
            if(found.isEmpty() || found.get().getPassword()==null || !enc.matches(password,found.get().getPassword()))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid student registration number or password"));
            Student st=found.get();
            return ResponseEntity.ok(Map.of("id",st.getId(),"name",st.getFullName(),"role","STUDENT","admissionNo",st.getAdmissionNo(),"email",st.getEmail()==null?"":st.getEmail()));
        }
        return ResponseEntity.badRequest().body(Map.of("message","Invalid role"));
    }
}

@RestController
@RequestMapping("/api/dashboard")
class DashboardController {
    private final StudentRepository s; private final TeacherRepository t;
    private final SubjectRepository sub; private final PaymentRepository p;
    DashboardController(StudentRepository s,TeacherRepository t,SubjectRepository sub,PaymentRepository p){
        this.s=s;this.t=t;this.sub=sub;this.p=p;
    }
    @GetMapping Map<String,Object> stats(){
        double total=p.findAll().stream().mapToDouble(x->x.getAmount()==null?0:x.getAmount()).sum();
        return Map.of("students",s.count(),"teachers",t.count(),"subjects",sub.count(),"payments",total);
    }
}
