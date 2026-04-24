package com.example.Spring_Boot_JPA.controller;

import com.example.Spring_Boot_JPA.service.CollegeErpService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/erp")
public class CollegeErpController {

    private final CollegeErpService collegeErpService;

    public CollegeErpController(CollegeErpService collegeErpService) {
        this.collegeErpService = collegeErpService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview() {
        return ResponseEntity.ok(collegeErpService.getOverview());
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.login(payload));
    }

    @GetMapping("/students")
    public ResponseEntity<Object> students() {
        return ResponseEntity.ok(collegeErpService.getStudents());
    }

    @PostMapping("/students/register")
    public ResponseEntity<Map<String, Object>> registerStudent(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.registerStudent(payload));
    }

    @GetMapping("/students/{studentId}/report-card")
    public ResponseEntity<Map<String, Object>> reportCard(@PathVariable String studentId) {
        return ResponseEntity.ok(collegeErpService.getResults(studentId));
    }

    @GetMapping("/faculty")
    public ResponseEntity<Object> faculty() {
        return ResponseEntity.ok(collegeErpService.getFaculty());
    }

    @PostMapping("/faculty")
    public ResponseEntity<Map<String, Object>> createFaculty(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.registerFaculty(payload));
    }

    @PostMapping("/faculty/attendance")
    public ResponseEntity<Map<String, Object>> attendance(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.recordAttendance(payload));
    }

    @PostMapping("/faculty/marks")
    public ResponseEntity<Map<String, Object>> marks(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.uploadMarks(payload));
    }

    @GetMapping("/timetable")
    public ResponseEntity<Map<String, Object>> timetable() {
        return ResponseEntity.ok(collegeErpService.getTimetable());
    }

    @PostMapping("/timetable/class")
    public ResponseEntity<Map<String, Object>> createClassSchedule(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.addClassSchedule(payload));
    }

    @PostMapping("/timetable/lab")
    public ResponseEntity<Map<String, Object>> createLabSchedule(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.addLabSchedule(payload));
    }

    @GetMapping("/exams")
    public ResponseEntity<Object> exams() {
        return ResponseEntity.ok(collegeErpService.getExams());
    }

    @PostMapping("/exams")
    public ResponseEntity<Map<String, Object>> createExam(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.createExam(payload));
    }

    @GetMapping("/fees")
    public ResponseEntity<Map<String, Object>> fees() {
        return ResponseEntity.ok(collegeErpService.getFeeSummary());
    }

    @PostMapping("/fees/pay")
    public ResponseEntity<Map<String, Object>> payFee(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.payFee(payload));
    }

    @GetMapping("/communications")
    public ResponseEntity<Map<String, Object>> communications() {
        return ResponseEntity.ok(collegeErpService.getCommunications());
    }

    @PostMapping("/communications/events")
    public ResponseEntity<Map<String, Object>> createEvent(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.addEvent(payload));
    }

    @GetMapping("/notices")
    public ResponseEntity<Object> notices() {
        return ResponseEntity.ok(collegeErpService.getNotices());
    }

    @PostMapping("/notices")
    public ResponseEntity<Map<String, Object>> addNotice(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.addNotice(payload));
    }

    @GetMapping("/library")
    public ResponseEntity<Object> library() {
        return ResponseEntity.ok(collegeErpService.getLibraryBooks());
    }

    @PostMapping("/library/books")
    public ResponseEntity<Map<String, Object>> createLibraryBook(@RequestBody Map<String, String> payload) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collegeErpService.addLibraryBook(payload));
    }

    @PostMapping("/library/issue")
    public ResponseEntity<Map<String, Object>> issueBook(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.issueBook(payload));
    }

    @PostMapping("/library/return")
    public ResponseEntity<Map<String, Object>> returnBook(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.returnBook(payload));
    }

    @GetMapping("/admin/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        return ResponseEntity.ok(collegeErpService.getAdminAnalytics());
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatbot(@RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(collegeErpService.chatbot(payload));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException exception) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("message", exception.getMessage());
        error.put("status", 400);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleStateError(IllegalStateException exception) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("message", exception.getMessage());
        error.put("status", 500);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
