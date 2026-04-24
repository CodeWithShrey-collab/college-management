# Aurora Campus ERP

`Aurora Campus ERP` is a college management platform built with `Java`, `Spring Boot`, `PostgreSQL`, and `Docker Compose`.
It upgrades the original sample project into a broader campus ERP with a polished frontend and database-backed academic workflows.

## Modules

- `Student Management`
  Registration, profile details, attendance, marks, and fee status
- `Faculty Management`
  Demo login, attendance updates, marks entry, timetable visibility, and course allocation
- `Timetable & Scheduling`
  Class schedule, exam timetable, and lab timings
- `Examination System`
  Exam creation, marks updates, result generation, and report card view
- `Fee Management`
  Fee payment tracking, history, and receipt records
- `Notice & Announcement System`
  College notices, event announcements, and emergency-style alerts
- `Library Management`
  Book catalog, issue/return flow, and fine tracking
- `Admin Analytics`
  Student/faculty counts, fee summaries, attendance, CGPA, and active notice metrics
- `AI Chatbot`
  Assistant responses generated from live database-backed ERP records

## Tech Stack

- `Java 8`
- `Spring Boot 2`
- `Spring Data JPA / Hibernate`
- `PostgreSQL`
- `Maven`
- `Docker`
- `Docker Compose`
- `HTML`, `CSS`, `JavaScript`

## Project Structure

The runnable application lives inside:

```text
postgres_spring_app/
```

Main files for the ERP layer:

- `postgres_spring_app/spring_boot_app/spring_boot_jpa/src/main/java/com/example/Spring_Boot_JPA/controller/CollegeErpController.java`
- `postgres_spring_app/spring_boot_app/spring_boot_jpa/src/main/java/com/example/Spring_Boot_JPA/service/CollegeErpService.java`
- `postgres_spring_app/spring_boot_app/spring_boot_jpa/src/main/resources/static/index.html`
- `postgres_spring_app/spring_boot_app/spring_boot_jpa/src/main/resources/static/app.css`
- `postgres_spring_app/spring_boot_app/spring_boot_jpa/src/main/resources/static/app.js`

## Prerequisites

Install:

- `Docker Desktop`
- `WSL` updates on Windows if Docker asks for it

Optional for local compile-only verification:

- `Java JDK`

## Run With Docker

Open a terminal in:

```powershell
cd "G:\Cloud Project\Dockerized_SpringBoot_PostgreSQL\postgres_spring_app"
```

Start the database and backend:

```powershell
docker compose up --build
```

When startup finishes, open:

```text
http://localhost:8090
```

The root route now forwards to the ERP frontend automatically.

To stop the app:

```powershell
docker compose down
```

To stop and clear saved database data:

```powershell
docker compose down -v
```

## Compile Locally

If you only want to verify compilation:

```powershell
cd "G:\Cloud Project\Dockerized_SpringBoot_PostgreSQL\postgres_spring_app\spring_boot_app\spring_boot_jpa"
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"
.\mvnw.cmd -q -DskipTests compile
```

## Main API Endpoints

Base path:

```text
/api/erp
```

Endpoints:

- `GET /api/erp/overview`
- `POST /api/erp/auth/login`
- `GET /api/erp/students`
- `POST /api/erp/students/register`
- `GET /api/erp/students/{studentId}/report-card`
- `GET /api/erp/faculty`
- `POST /api/erp/faculty/attendance`
- `POST /api/erp/faculty/marks`
- `GET /api/erp/timetable`
- `GET /api/erp/exams`
- `POST /api/erp/exams`
- `GET /api/erp/fees`
- `POST /api/erp/fees/pay`
- `GET /api/erp/notices`
- `POST /api/erp/notices`
- `GET /api/erp/communications`
- `GET /api/erp/library`
- `POST /api/erp/library/issue`
- `POST /api/erp/library/return`
- `GET /api/erp/admin/analytics`
- `POST /api/erp/chat`

## Sample Requests

Register a student:

```powershell
Invoke-RestMethod -Uri "http://localhost:8090/api/erp/students/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"studentId":"S201","name":"Aditi Rao","email":"aditi.rao@aurora.edu","department":"Computer Science","semester":"Semester 2","phone":"+91-99999-12345"}'
```

Create an exam:

```powershell
Invoke-RestMethod -Uri "http://localhost:8090/api/erp/exams" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"course":"Cloud Computing","date":"2026-05-20","slot":"10:00 AM - 01:00 PM","hall":"Hall B","type":"End Semester"}'
```

Record fee payment:

```powershell
Invoke-RestMethod -Uri "http://localhost:8090/api/erp/fees/pay" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"studentId":"S102","amount":"25000","mode":"Online"}'
```

Ask the AI assistant:

```powershell
Invoke-RestMethod -Uri "http://localhost:8090/api/erp/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"question":"When is my next exam?"}'
```

## Browser Routes

- `http://localhost:8090`
- `http://localhost:8090/index.html`

## Deploy To Render

This repo includes a ready-to-use [render.yaml](G:\Cloud Project\Dockerized_SpringBoot_PostgreSQL\render.yaml:1) blueprint.

Recommended Render setup:

1. Create a new `Blueprint` service in Render.
2. Connect the GitHub repo.
3. Render will detect:
   - Web service name: `college-management`
   - Root directory: `postgres_spring_app/spring_boot_app/spring_boot_jpa`
   - Build command: `./mvnw clean package -DskipTests`
   - Start command: `java -Dserver.port=$PORT -jar target/Spring_Boot_JPA-0.0.1-SNAPSHOT.jar`
4. Render will also provision the PostgreSQL database defined in `render.yaml`.
5. After deployment, open the generated Render URL.

Important:

- The UI uses Firebase Authentication and Firebase Realtime Database for login/session/data workflows.
- The AI Assistant page now supports a GPTOSS-compatible Cloudflare Worker and defaults to model `gpt-oss-20b`.
- After deployment, open `/assistant.html` and save your Worker URL, for example `https://your-worker.workers.dev`.
- The Spring Boot service still needs PostgreSQL at startup because JPA entities and repositories are part of the app.
- `application.properties` now supports Render environment variables for datasource and port configuration.

## Notes

- The ERP frontend is multi-page.
- Role-based login and most interactive campus workflows are backed by Firebase.
- The Spring Boot application still initializes with PostgreSQL because the app includes JPA repositories and entities.
- The legacy book/topic APIs from the original repository still exist in the codebase.
- Docker Compose remains the easiest way to run it locally end to end.

## Credits

Original repository:
[ankitrajput0096/Dockerized_SpringBoot_PostgreSQL](https://github.com/ankitrajput0096/Dockerized_SpringBoot_PostgreSQL)
