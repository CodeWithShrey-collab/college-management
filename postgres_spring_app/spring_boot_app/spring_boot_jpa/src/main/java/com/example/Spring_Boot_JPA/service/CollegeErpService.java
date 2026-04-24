package com.example.Spring_Boot_JPA.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.Spring_Boot_JPA.entity.*;
import com.example.Spring_Boot_JPA.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Transactional
public class CollegeErpService {

    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final ScheduleEntryRepository scheduleEntryRepository;
    private final ExamRecordRepository examRecordRepository;
    private final StudentResultRepository studentResultRepository;
    private final NoticeItemRepository noticeItemRepository;
    private final EventAnnouncementRepository eventAnnouncementRepository;
    private final LibraryBookItemRepository libraryBookItemRepository;
    private final FeeReceiptEntryRepository feeReceiptEntryRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${nvidia.api.key:}")
    private String nvidiaApiKey;

    @Value("${nvidia.api.base-url:https://integrate.api.nvidia.com/v1}")
    private String nvidiaApiBaseUrl;

    @Value("${nvidia.api.model:meta/llama-3.1-8b-instruct}")
    private String nvidiaApiModel;

    public CollegeErpService(StudentProfileRepository studentProfileRepository,
                             FacultyProfileRepository facultyProfileRepository,
                             ScheduleEntryRepository scheduleEntryRepository,
                             ExamRecordRepository examRecordRepository,
                             StudentResultRepository studentResultRepository,
                             NoticeItemRepository noticeItemRepository,
                             EventAnnouncementRepository eventAnnouncementRepository,
                             LibraryBookItemRepository libraryBookItemRepository,
                             FeeReceiptEntryRepository feeReceiptEntryRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.scheduleEntryRepository = scheduleEntryRepository;
        this.examRecordRepository = examRecordRepository;
        this.studentResultRepository = studentResultRepository;
        this.noticeItemRepository = noticeItemRepository;
        this.eventAnnouncementRepository = eventAnnouncementRepository;
        this.libraryBookItemRepository = libraryBookItemRepository;
        this.feeReceiptEntryRepository = feeReceiptEntryRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOverview() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        long facultyCount = facultyProfileRepository.count();
        long noticeCount = noticeItemRepository.count();
        long libraryCount = libraryBookItemRepository.count();

        return map(
                "platformName", "Aurora Campus ERP",
                "subtitle", "A live college operating system powered by dynamic academic, financial, and communication data.",
                "heroMetrics", Arrays.asList(
                        metric("Students", students.size(), "Active campus learners"),
                        metric("Faculty", facultyCount, "Teaching and mentors"),
                        metric("Notices", noticeCount, "Live institutional updates"),
                        metric("Library Books", libraryCount, "Trackable resources")
                ),
                "moduleHighlights", Arrays.asList(
                        module("Student Management", "Registration, profiles, attendance, grades, and fees in one place."),
                        module("Faculty Workspace", "Faculty records, academic updates, and allocation visibility."),
                        module("Examination System", "Exam scheduling, marks capture, and report cards using saved records."),
                        module("Smart Campus Services", "Notices, events, library, admin analytics, and AI-powered student help.")
                ),
                "quickStats", getAdminAnalytics()
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudents() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        students.sort(Comparator.comparing(StudentProfile::getStudentId));
        List<Map<String, Object>> response = new ArrayList<>();
        for (StudentProfile student : students) {
            response.add(studentMap(student));
        }
        return response;
    }

    public Map<String, Object> registerStudent(Map<String, String> payload) {
        String studentId = firstNonBlank(payload.get("studentId"), nextCode("S", studentProfileRepository.count() + 1));
        if (studentProfileRepository.existsByStudentId(studentId)) {
            throw new IllegalArgumentException("Student ID already exists: " + studentId);
        }

        StudentProfile student = StudentProfile.builder()
                .studentId(studentId)
                .name(firstNonBlank(payload.get("name"), "New Student"))
                .email(firstNonBlank(payload.get("email"), studentId.toLowerCase(Locale.ENGLISH) + "@aurora.edu"))
                .department(firstNonBlank(payload.get("department"), "Undeclared"))
                .semester(firstNonBlank(payload.get("semester"), "Semester 1"))
                .attendance(parseInt(payload.get("attendance"), 0))
                .cgpa(decimal(payload.get("cgpa"), "0.00"))
                .feeStatus(firstNonBlank(payload.get("feeStatus"), "Pending"))
                .feeDue(parseInt(payload.get("feeDue"), 0))
                .mentor(firstNonBlank(payload.get("mentor"), "Not Assigned"))
                .phone(firstNonBlank(payload.get("phone"), "-"))
                .loginStatus(firstNonBlank(payload.get("loginStatus"), "Registered"))
                .build();

        return studentMap(studentProfileRepository.save(student));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFaculty() {
        List<FacultyProfile> faculty = facultyProfileRepository.findAll();
        faculty.sort(Comparator.comparing(FacultyProfile::getFacultyId));
        List<Map<String, Object>> response = new ArrayList<>();
        for (FacultyProfile member : faculty) {
            response.add(facultyMap(member));
        }
        return response;
    }

    public Map<String, Object> registerFaculty(Map<String, String> payload) {
        String facultyId = firstNonBlank(payload.get("facultyId"), nextCode("F", facultyProfileRepository.count() + 1));
        if (facultyProfileRepository.existsByFacultyId(facultyId)) {
            throw new IllegalArgumentException("Faculty ID already exists: " + facultyId);
        }

        FacultyProfile faculty = FacultyProfile.builder()
                .facultyId(facultyId)
                .name(firstNonBlank(payload.get("name"), "New Faculty Member"))
                .department(firstNonBlank(payload.get("department"), "General"))
                .specialization(firstNonBlank(payload.get("specialization"), "Academic Advisory"))
                .allocatedCourse(firstNonBlank(payload.get("allocatedCourse"), "Unassigned"))
                .officeHours(firstNonBlank(payload.get("officeHours"), "To be announced"))
                .loginStatus(firstNonBlank(payload.get("loginStatus"), "Active"))
                .email(firstNonBlank(payload.get("email"), facultyId.toLowerCase(Locale.ENGLISH) + "@aurora.edu"))
                .build();

        return facultyMap(facultyProfileRepository.save(faculty));
    }

    public Map<String, Object> login(Map<String, String> payload) {
        String role = firstNonBlank(payload.get("role"), "student");
        String username = firstNonBlank(payload.get("username"), "demo.user");
        return map(
                "status", "success",
                "role", role,
                "username", username,
                "message", "Dynamic login simulation completed. Role-based access granted for " + role + "."
        );
    }

    public Map<String, Object> recordAttendance(Map<String, String> payload) {
        StudentProfile student = findStudent(payload.get("studentId"));
        int attendance = parseInt(payload.get("attendance"), student.getAttendance() == null ? 0 : student.getAttendance());
        student.setAttendance(attendance);
        studentProfileRepository.save(student);
        return map(
                "status", "updated",
                "studentId", student.getStudentId(),
                "attendance", attendance,
                "message", "Attendance updated successfully."
        );
    }

    public Map<String, Object> uploadMarks(Map<String, String> payload) {
        StudentProfile student = findStudent(payload.get("studentId"));
        if (!text(payload.get("cgpa")).isEmpty()) {
            student.setCgpa(decimal(payload.get("cgpa"), student.getCgpa() == null ? "0.00" : student.getCgpa().toString()));
            studentProfileRepository.save(student);
        }

        String subject = text(payload.get("subject"));
        StudentResult result = null;
        if (!subject.isEmpty()) {
            result = studentResultRepository.findByStudentIdAndSubject(student.getStudentId(), subject)
                    .orElse(StudentResult.builder().studentId(student.getStudentId()).subject(subject).build());
            result.setMarks(parseInt(payload.get("marks"), result.getMarks() == null ? 0 : result.getMarks()));
            result.setGrade(firstNonBlank(payload.get("grade"), firstNonBlank(result.getGrade(), "NA")));
            result = studentResultRepository.save(result);
        }

        return map(
                "status", "updated",
                "studentId", student.getStudentId(),
                "cgpa", student.getCgpa(),
                "subject", result == null ? "" : result.getSubject(),
                "message", "Marks and grade profile updated successfully."
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTimetable() {
        List<Map<String, Object>> classSchedule = new ArrayList<>();
        for (ScheduleEntry entry : scheduleEntryRepository.findAllByScheduleTypeOrderByIdAsc("CLASS")) {
            classSchedule.add(map(
                    "scheduleId", entry.getScheduleId(),
                    "day", entry.getDayName(),
                    "time", entry.getTimeSlot(),
                    "course", entry.getTitle(),
                    "faculty", entry.getFacultyName(),
                    "room", entry.getRoom()
            ));
        }

        List<Map<String, Object>> labSchedule = new ArrayList<>();
        for (ScheduleEntry entry : scheduleEntryRepository.findAllByScheduleTypeOrderByIdAsc("LAB")) {
            labSchedule.add(map(
                    "scheduleId", entry.getScheduleId(),
                    "day", entry.getDayName(),
                    "time", entry.getTimeSlot(),
                    "lab", entry.getTitle(),
                    "faculty", entry.getFacultyName(),
                    "room", firstNonBlank(entry.getVenue(), entry.getRoom())
            ));
        }

        return map(
                "classSchedule", classSchedule,
                "examSchedule", getExams(),
                "labSchedule", labSchedule
        );
    }

    public Map<String, Object> addClassSchedule(Map<String, String> payload) {
        return scheduleMap(scheduleEntryRepository.save(ScheduleEntry.builder()
                .scheduleId(firstNonBlank(payload.get("scheduleId"), nextCode("CL", scheduleEntryRepository.count() + 1)))
                .scheduleType("CLASS")
                .dayName(firstNonBlank(payload.get("day"), "Monday"))
                .timeSlot(firstNonBlank(payload.get("time"), "09:00 AM - 10:00 AM"))
                .title(firstNonBlank(payload.get("course"), "Untitled Class"))
                .facultyName(firstNonBlank(payload.get("faculty"), "Not Assigned"))
                .room(firstNonBlank(payload.get("room"), "TBD"))
                .venue(firstNonBlank(payload.get("room"), "TBD"))
                .build()));
    }

    public Map<String, Object> addLabSchedule(Map<String, String> payload) {
        return scheduleMap(scheduleEntryRepository.save(ScheduleEntry.builder()
                .scheduleId(firstNonBlank(payload.get("scheduleId"), nextCode("LB", scheduleEntryRepository.count() + 1)))
                .scheduleType("LAB")
                .dayName(firstNonBlank(payload.get("day"), "Friday"))
                .timeSlot(firstNonBlank(payload.get("time"), "02:00 PM - 04:00 PM"))
                .title(firstNonBlank(payload.get("lab"), "Untitled Lab"))
                .facultyName(firstNonBlank(payload.get("faculty"), "Not Assigned"))
                .room(firstNonBlank(payload.get("room"), "Lab Wing"))
                .venue(firstNonBlank(payload.get("room"), "Lab Wing"))
                .build()));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExams() {
        List<ExamRecord> exams = examRecordRepository.findAll();
        exams.sort(Comparator.comparing(ExamRecord::getExamId));
        List<Map<String, Object>> response = new ArrayList<>();
        for (ExamRecord exam : exams) {
            response.add(examMap(exam));
        }
        return response;
    }

    public Map<String, Object> createExam(Map<String, String> payload) {
        ExamRecord exam = ExamRecord.builder()
                .examId(firstNonBlank(payload.get("examId"), nextCode("EX", examRecordRepository.count() + 1)))
                .course(firstNonBlank(payload.get("course"), "Untitled Course"))
                .examDate(firstNonBlank(payload.get("date"), formatDate(new Date())))
                .slot(firstNonBlank(payload.get("slot"), "10:00 AM - 01:00 PM"))
                .hall(firstNonBlank(payload.get("hall"), "TBD"))
                .type(firstNonBlank(payload.get("type"), "Internal"))
                .build();
        return examMap(examRecordRepository.save(exam));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResults(String studentId) {
        StudentProfile student = findStudent(studentId);
        List<StudentResult> results = studentResultRepository.findAllByStudentIdOrderByIdAsc(student.getStudentId());
        List<Map<String, Object>> reportCard = new ArrayList<>();
        for (StudentResult result : results) {
            reportCard.add(map(
                    "subject", result.getSubject(),
                    "grade", firstNonBlank(result.getGrade(), "NA"),
                    "marks", result.getMarks() == null ? 0 : result.getMarks()
            ));
        }
        return map(
                "studentId", student.getStudentId(),
                "studentName", student.getName(),
                "department", student.getDepartment(),
                "semester", student.getSemester(),
                "attendance", student.getAttendance() == null ? 0 : student.getAttendance(),
                "cgpa", student.getCgpa() == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : student.getCgpa(),
                "reportCard", reportCard
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFeeSummary() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        students.sort(Comparator.comparing(StudentProfile::getStudentId));
        List<Map<String, Object>> statuses = new ArrayList<>();
        for (StudentProfile student : students) {
            statuses.add(map(
                    "studentId", student.getStudentId(),
                    "studentName", student.getName(),
                    "feeStatus", firstNonBlank(student.getFeeStatus(), "Pending"),
                    "feeDue", student.getFeeDue() == null ? 0 : student.getFeeDue()
            ));
        }

        List<Map<String, Object>> receipts = new ArrayList<>();
        for (FeeReceiptEntry receipt : feeReceiptEntryRepository.findAllByOrderByIdDesc()) {
            receipts.add(receiptMap(receipt));
        }

        return map("statuses", statuses, "receipts", receipts);
    }

    public Map<String, Object> payFee(Map<String, String> payload) {
        StudentProfile student = findStudent(payload.get("studentId"));
        int amount = parseInt(payload.get("amount"), 0);
        String mode = firstNonBlank(payload.get("mode"), "Online");

        int currentDue = student.getFeeDue() == null ? 0 : student.getFeeDue();
        int remaining = Math.max(currentDue - amount, 0);
        student.setFeeDue(remaining);
        student.setFeeStatus(remaining == 0 ? "Paid" : "Pending");
        studentProfileRepository.save(student);

        FeeReceiptEntry receipt = FeeReceiptEntry.builder()
                .receiptId(nextCode("RCPT", feeReceiptEntryRepository.count() + 1))
                .studentId(student.getStudentId())
                .studentName(student.getName())
                .amount(amount)
                .mode(mode)
                .paymentDate(formatDate(new Date()))
                .build();

        return receiptMap(feeReceiptEntryRepository.save(receipt));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getNotices() {
        List<NoticeItem> notices = noticeItemRepository.findAll();
        notices.sort((left, right) -> right.getId().compareTo(left.getId()));
        List<Map<String, Object>> response = new ArrayList<>();
        for (NoticeItem notice : notices) {
            response.add(noticeMap(notice));
        }
        return response;
    }

    public Map<String, Object> addNotice(Map<String, String> payload) {
        NoticeItem notice = NoticeItem.builder()
                .noticeId(firstNonBlank(payload.get("noticeId"), nextCode("NT", noticeItemRepository.count() + 1)))
                .title(firstNonBlank(payload.get("title"), "Untitled Notice"))
                .category(firstNonBlank(payload.get("category"), "General"))
                .priority(firstNonBlank(payload.get("priority"), "Medium"))
                .noticeDate(firstNonBlank(payload.get("date"), formatDate(new Date())))
                .message(firstNonBlank(payload.get("message"), "Notice details pending."))
                .build();
        return noticeMap(noticeItemRepository.save(notice));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCommunications() {
        List<Map<String, Object>> notices = getNotices();
        List<EventAnnouncement> events = eventAnnouncementRepository.findAll();
        events.sort((left, right) -> right.getId().compareTo(left.getId()));
        List<Map<String, Object>> eventMaps = new ArrayList<>();
        for (EventAnnouncement event : events) {
            eventMaps.add(eventMap(event));
        }
        return map("notices", notices, "events", eventMaps);
    }

    public Map<String, Object> addEvent(Map<String, String> payload) {
        EventAnnouncement event = EventAnnouncement.builder()
                .eventId(firstNonBlank(payload.get("eventId"), nextCode("EV", eventAnnouncementRepository.count() + 1)))
                .title(firstNonBlank(payload.get("title"), "Untitled Event"))
                .category(firstNonBlank(payload.get("category"), "Campus"))
                .eventDate(firstNonBlank(payload.get("date"), formatDate(new Date())))
                .venue(firstNonBlank(payload.get("venue"), "Main Campus"))
                .message(firstNonBlank(payload.get("message"), "Event details pending."))
                .build();
        return eventMap(eventAnnouncementRepository.save(event));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLibraryBooks() {
        List<LibraryBookItem> books = libraryBookItemRepository.findAll();
        books.sort(Comparator.comparing(LibraryBookItem::getBookId));
        List<Map<String, Object>> response = new ArrayList<>();
        for (LibraryBookItem book : books) {
            response.add(libraryMap(book));
        }
        return response;
    }

    public Map<String, Object> addLibraryBook(Map<String, String> payload) {
        String bookId = firstNonBlank(payload.get("bookId"), nextCode("B", libraryBookItemRepository.count() + 1));
        if (libraryBookItemRepository.existsByBookId(bookId)) {
            throw new IllegalArgumentException("Book ID already exists: " + bookId);
        }

        LibraryBookItem book = LibraryBookItem.builder()
                .bookId(bookId)
                .title(firstNonBlank(payload.get("title"), "Untitled Book"))
                .author(firstNonBlank(payload.get("author"), "Unknown Author"))
                .status("Available")
                .borrower("None")
                .dueDate("-")
                .fine(0)
                .build();
        return libraryMap(libraryBookItemRepository.save(book));
    }

    public Map<String, Object> issueBook(Map<String, String> payload) {
        LibraryBookItem book = findBook(payload.get("bookId"));
        book.setStatus("Issued");
        book.setBorrower(firstNonBlank(payload.get("studentName"), "Assigned Student"));
        book.setDueDate(firstNonBlank(payload.get("dueDate"), formatDate(new Date())));
        book.setFine(0);
        return libraryMap(libraryBookItemRepository.save(book));
    }

    public Map<String, Object> returnBook(Map<String, String> payload) {
        LibraryBookItem book = findBook(payload.get("bookId"));
        book.setStatus("Available");
        book.setBorrower("None");
        book.setDueDate("-");
        book.setFine(parseInt(payload.get("fine"), 0));
        return libraryMap(libraryBookItemRepository.save(book));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdminAnalytics() {
        List<StudentProfile> students = studentProfileRepository.findAll();
        int paidCount = 0;
        int pendingCount = 0;
        double attendanceSum = 0;
        double cgpaSum = 0;

        for (StudentProfile student : students) {
            attendanceSum += student.getAttendance() == null ? 0 : student.getAttendance();
            cgpaSum += student.getCgpa() == null ? 0 : student.getCgpa().doubleValue();
            if ("Paid".equalsIgnoreCase(firstNonBlank(student.getFeeStatus(), "Pending"))) {
                paidCount++;
            } else {
                pendingCount++;
            }
        }

        double avgAttendance = students.isEmpty() ? 0 : attendanceSum / students.size();
        double avgCgpa = students.isEmpty() ? 0 : cgpaSum / students.size();
        long booksIssued = libraryBookItemRepository.findAll().stream()
                .filter(book -> "Issued".equalsIgnoreCase(firstNonBlank(book.getStatus(), "")))
                .count();

        return map(
                "totalStudents", students.size(),
                "totalFaculty", facultyProfileRepository.count(),
                "paidFees", paidCount,
                "pendingFees", pendingCount,
                "averageAttendance", round(avgAttendance),
                "averageCgpa", round(avgCgpa),
                "activeNotices", noticeItemRepository.count(),
                "booksIssued", booksIssued
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> chatbot(Map<String, String> payload) {
        String question = firstNonBlank(payload.get("question"), "");
        if (question.isEmpty()) {
            throw new IllegalArgumentException("Question is required.");
        }
        if (text(nvidiaApiKey).isEmpty()) {
            throw new IllegalStateException("NVIDIA_API_KEY is not configured on the server.");
        }

        String answer;
        try {
            answer = askNvidia(question);
        } catch (Exception exception) {
            throw new IllegalStateException("NVIDIA assistant request failed: " + exception.getMessage(), exception);
        }

        return map(
                "question", payload.get("question"),
                "answer", answer,
                "provider", "NVIDIA API",
                "model", nvidiaApiModel
        );
    }

    private String askNvidia(String question) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(nvidiaApiKey.trim());
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = map(
                "model", nvidiaApiModel,
                "messages", Arrays.asList(
                        map(
                                "role", "system",
                                "content", buildAssistantSystemPrompt()
                        ),
                        map(
                                "role", "user",
                                "content", question
                        )
                ),
                "temperature", 0.3,
                "max_tokens", 512,
                "stream", false
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                trimTrailingSlash(nvidiaApiBaseUrl) + "/chat/completions",
                entity,
                String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        JsonNode contentNode = root.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || text(contentNode.asText()).isEmpty()) {
            throw new IllegalStateException("No assistant content returned by NVIDIA.");
        }
        return contentNode.asText().trim();
    }

    private String buildAssistantSystemPrompt() {
        Map<String, Object> analytics = getAdminAnalytics();
        List<StudentProfile> students = studentProfileRepository.findAll();
        List<ExamRecord> exams = examRecordRepository.findAll();
        List<NoticeItem> notices = noticeItemRepository.findAll();
        List<LibraryBookItem> books = libraryBookItemRepository.findAll();

        students.sort(Comparator.comparing(StudentProfile::getStudentId));
        exams.sort(Comparator.comparing(ExamRecord::getExamId));
        notices.sort((left, right) -> right.getId().compareTo(left.getId()));

        StudentProfile sampleStudent = students.isEmpty() ? null : students.get(0);
        ExamRecord nextExam = exams.isEmpty() ? null : exams.get(0);
        NoticeItem latestNotice = notices.isEmpty() ? null : notices.get(0);
        long issuedBooks = books.stream()
                .filter(book -> "Issued".equalsIgnoreCase(firstNonBlank(book.getStatus(), "")))
                .count();

        StringBuilder context = new StringBuilder();
        context.append("You are Aurora Campus ERP Assistant. ");
        context.append("Answer only using the campus data provided below. ");
        context.append("If the requested detail is missing, say that the ERP does not currently contain that exact record. ");
        context.append("Keep answers concise, helpful, and student-friendly.\n\n");
        context.append("Campus analytics:\n");
        context.append("- Total students: ").append(analytics.get("totalStudents")).append('\n');
        context.append("- Total faculty: ").append(analytics.get("totalFaculty")).append('\n');
        context.append("- Pending fees: ").append(analytics.get("pendingFees")).append('\n');
        context.append("- Average attendance: ").append(analytics.get("averageAttendance")).append("%\n");
        context.append("- Active notices: ").append(analytics.get("activeNotices")).append('\n');
        context.append("- Books issued: ").append(issuedBooks).append('\n');

        if (sampleStudent != null) {
            context.append("Sample student record:\n");
            context.append("- ").append(sampleStudent.getName())
                    .append(" (").append(sampleStudent.getStudentId()).append("), ")
                    .append(firstNonBlank(sampleStudent.getDepartment(), "Department unavailable"))
                    .append(", attendance ")
                    .append(sampleStudent.getAttendance() == null ? 0 : sampleStudent.getAttendance())
                    .append("%, fee status ")
                    .append(firstNonBlank(sampleStudent.getFeeStatus(), "Unknown"))
                    .append(", fee due Rs. ")
                    .append(sampleStudent.getFeeDue() == null ? 0 : sampleStudent.getFeeDue())
                    .append('\n');
        }

        if (nextExam != null) {
            context.append("Next recorded exam:\n");
            context.append("- ").append(nextExam.getCourse())
                    .append(" on ").append(firstNonBlank(nextExam.getExamDate(), "TBD"))
                    .append(" at ").append(firstNonBlank(nextExam.getSlot(), "TBD"))
                    .append(" in ").append(firstNonBlank(nextExam.getHall(), "TBD"))
                    .append('\n');
        }

        if (latestNotice != null) {
            context.append("Latest notice:\n");
            context.append("- ").append(latestNotice.getTitle())
                    .append(" [").append(firstNonBlank(latestNotice.getCategory(), "General")).append("] ")
                    .append(firstNonBlank(latestNotice.getMessage(), ""))
                    .append('\n');
        }

        return context.toString();
    }

    private StudentProfile findStudent(String studentId) {
        return studentProfileRepository.findByStudentId(text(studentId))
                .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
    }

    private LibraryBookItem findBook(String bookId) {
        return libraryBookItemRepository.findByBookId(text(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
    }

    private Map<String, Object> studentMap(StudentProfile student) {
        return map(
                "studentId", student.getStudentId(),
                "name", student.getName(),
                "email", firstNonBlank(student.getEmail(), "-"),
                "department", firstNonBlank(student.getDepartment(), "-"),
                "semester", firstNonBlank(student.getSemester(), "-"),
                "attendance", student.getAttendance() == null ? 0 : student.getAttendance(),
                "cgpa", student.getCgpa() == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : student.getCgpa(),
                "feeStatus", firstNonBlank(student.getFeeStatus(), "Pending"),
                "feeDue", student.getFeeDue() == null ? 0 : student.getFeeDue(),
                "mentor", firstNonBlank(student.getMentor(), "-"),
                "phone", firstNonBlank(student.getPhone(), "-"),
                "loginStatus", firstNonBlank(student.getLoginStatus(), "Active")
        );
    }

    private Map<String, Object> facultyMap(FacultyProfile faculty) {
        return map(
                "facultyId", faculty.getFacultyId(),
                "name", faculty.getName(),
                "department", firstNonBlank(faculty.getDepartment(), "-"),
                "specialization", firstNonBlank(faculty.getSpecialization(), "-"),
                "allocatedCourse", firstNonBlank(faculty.getAllocatedCourse(), "Unassigned"),
                "officeHours", firstNonBlank(faculty.getOfficeHours(), "-"),
                "loginStatus", firstNonBlank(faculty.getLoginStatus(), "Active"),
                "email", firstNonBlank(faculty.getEmail(), "-")
        );
    }

    private Map<String, Object> scheduleMap(ScheduleEntry entry) {
        return map(
                "scheduleId", entry.getScheduleId(),
                "type", entry.getScheduleType(),
                "day", firstNonBlank(entry.getDayName(), "-"),
                "date", firstNonBlank(entry.getDateValue(), "-"),
                "time", firstNonBlank(entry.getTimeSlot(), "-"),
                "title", firstNonBlank(entry.getTitle(), "-"),
                "faculty", firstNonBlank(entry.getFacultyName(), "-"),
                "room", firstNonBlank(entry.getRoom(), "-"),
                "venue", firstNonBlank(entry.getVenue(), "-")
        );
    }

    private Map<String, Object> examMap(ExamRecord exam) {
        return map(
                "examId", exam.getExamId(),
                "course", exam.getCourse(),
                "date", firstNonBlank(exam.getExamDate(), "-"),
                "slot", firstNonBlank(exam.getSlot(), "-"),
                "hall", firstNonBlank(exam.getHall(), "-"),
                "type", firstNonBlank(exam.getType(), "Internal")
        );
    }

    private Map<String, Object> noticeMap(NoticeItem notice) {
        return map(
                "noticeId", notice.getNoticeId(),
                "title", notice.getTitle(),
                "category", firstNonBlank(notice.getCategory(), "General"),
                "priority", firstNonBlank(notice.getPriority(), "Medium"),
                "date", firstNonBlank(notice.getNoticeDate(), "-"),
                "message", firstNonBlank(notice.getMessage(), "")
        );
    }

    private Map<String, Object> eventMap(EventAnnouncement event) {
        return map(
                "eventId", event.getEventId(),
                "title", event.getTitle(),
                "category", firstNonBlank(event.getCategory(), "Campus"),
                "date", firstNonBlank(event.getEventDate(), "-"),
                "venue", firstNonBlank(event.getVenue(), "-"),
                "message", firstNonBlank(event.getMessage(), "")
        );
    }

    private Map<String, Object> libraryMap(LibraryBookItem book) {
        return map(
                "bookId", book.getBookId(),
                "title", book.getTitle(),
                "author", firstNonBlank(book.getAuthor(), "-"),
                "status", firstNonBlank(book.getStatus(), "Available"),
                "borrower", firstNonBlank(book.getBorrower(), "None"),
                "dueDate", firstNonBlank(book.getDueDate(), "-"),
                "fine", book.getFine() == null ? 0 : book.getFine()
        );
    }

    private Map<String, Object> receiptMap(FeeReceiptEntry receipt) {
        return map(
                "receiptId", receipt.getReceiptId(),
                "studentId", receipt.getStudentId(),
                "studentName", firstNonBlank(receipt.getStudentName(), "-"),
                "amount", receipt.getAmount() == null ? 0 : receipt.getAmount(),
                "mode", firstNonBlank(receipt.getMode(), "Online"),
                "date", firstNonBlank(receipt.getPaymentDate(), "-")
        );
    }

    private Map<String, Object> metric(String label, Object value, String description) {
        return map("label", label, "value", value, "description", description);
    }

    private Map<String, Object> module(String title, String description) {
        return map("title", title, "description", description);
    }

    private Map<String, Object> map(Object... pairs) {
        Map<String, Object> data = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            data.put(String.valueOf(pairs[i]), pairs[i + 1]);
        }
        return data;
    }

    private String text(String value) {
        return value == null ? "" : value.trim();
    }

    private String firstNonBlank(String value, String fallback) {
        return text(value).isEmpty() ? fallback : value.trim();
    }

    private int parseInt(String value, int fallback) {
        try {
            return Integer.parseInt(text(value));
        } catch (Exception ex) {
            return fallback;
        }
    }

    private BigDecimal decimal(String value, String fallback) {
        try {
            return new BigDecimal(firstNonBlank(value, fallback)).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception ex) {
            return new BigDecimal(fallback).setScale(2, RoundingMode.HALF_UP);
        }
    }

    private BigDecimal round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private String formatDate(Date date) {
        return new SimpleDateFormat("yyyy-MM-dd").format(date);
    }

    private String nextCode(String prefix, long sequence) {
        return prefix + String.format(Locale.ENGLISH, "%03d", sequence);
    }

    private String trimTrailingSlash(String value) {
        return text(value).replaceAll("/+$", "");
    }
}
