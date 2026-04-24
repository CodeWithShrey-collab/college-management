package com.example.Spring_Boot_JPA.controller;

import com.example.Spring_Boot_JPA.dto.CollegeDashboardDto;
import com.example.Spring_Boot_JPA.dto.CourseDto;
import com.example.Spring_Boot_JPA.dto.StudentDto;
import com.example.Spring_Boot_JPA.dto.BookDto;
import com.example.Spring_Boot_JPA.dto.TopicDto;
import com.example.Spring_Boot_JPA.service.BooksAndTopicsSpringService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/college")
public class CollegeManagementController {

    private final BooksAndTopicsSpringService booksAndTopicsSpringService;

    public CollegeManagementController(BooksAndTopicsSpringService booksAndTopicsSpringService) {
        this.booksAndTopicsSpringService = booksAndTopicsSpringService;
    }

    @GetMapping
    public ResponseEntity<CollegeDashboardDto> home() {
        return ResponseEntity.ok(CollegeDashboardDto.builder()
                .projectName("College Management API")
                .projectDescription("Dockerized Spring Boot and PostgreSQL backend for managing students and courses.")
                .studentCount(this.booksAndTopicsSpringService.getAllBookDtos().size())
                .courseCount(this.booksAndTopicsSpringService.getAllTopicsDtos().size())
                .build());
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentDto>> getStudents() {
        return ResponseEntity.ok(this.booksAndTopicsSpringService.getAllBookDtos().stream()
                .map(this::toStudentDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentDto> getStudent(@PathVariable String id) {
        return ResponseEntity.ok(toStudentDto(this.booksAndTopicsSpringService.getBookDto(id)));
    }

    @PostMapping("/students")
    public ResponseEntity<String> addStudent(@RequestBody StudentDto studentDto) {
        this.booksAndTopicsSpringService.addBookDto(toBookDto(studentDto));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Student created successfully with id: " + studentDto.getId());
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<String> updateStudent(@RequestBody StudentDto studentDto, @PathVariable String id) {
        this.booksAndTopicsSpringService.updateBookDto(toBookDto(studentDto), id);
        return ResponseEntity.ok("Student updated successfully with id: " + id);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable String id) {
        this.booksAndTopicsSpringService.deleteBook(id);
        return ResponseEntity.ok("Student deleted successfully with id: " + id);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto>> getCourses() {
        return ResponseEntity.ok(this.booksAndTopicsSpringService.getAllTopicsDtos().stream()
                .map(this::toCourseDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDto> getCourse(@PathVariable String id) {
        return ResponseEntity.ok(toCourseDto(this.booksAndTopicsSpringService.getTopicDto(id)));
    }

    @PostMapping("/courses")
    public ResponseEntity<String> addCourse(@RequestBody CourseDto courseDto) {
        this.booksAndTopicsSpringService.addTopicDto(toTopicDto(courseDto));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Course created successfully with id: " + courseDto.getId());
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<String> updateCourse(@RequestBody CourseDto courseDto, @PathVariable String id) {
        this.booksAndTopicsSpringService.updateTopicDto(toTopicDto(courseDto), id);
        return ResponseEntity.ok("Course updated successfully with id: " + id);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<String> deleteCourse(@PathVariable String id) {
        this.booksAndTopicsSpringService.deleteTopic(id);
        return ResponseEntity.ok("Course deleted successfully with id: " + id);
    }

    private StudentDto toStudentDto(BookDto bookDto) {
        return StudentDto.builder()
                .id(bookDto.getId())
                .name(bookDto.getName())
                .build();
    }

    private BookDto toBookDto(StudentDto studentDto) {
        return BookDto.builder()
                .id(studentDto.getId())
                .name(studentDto.getName())
                .build();
    }

    private CourseDto toCourseDto(TopicDto topicDto) {
        return CourseDto.builder()
                .id(topicDto.getId())
                .name(topicDto.getName())
                .description(topicDto.getDescription())
                .build();
    }

    private TopicDto toTopicDto(CourseDto courseDto) {
        return TopicDto.builder()
                .id(courseDto.getId())
                .name(courseDto.getName())
                .description(courseDto.getDescription())
                .build();
    }
}
