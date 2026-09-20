# School Management System - Fixed

## Backend
Requirements:
- JDK 24
- MySQL 8.x
- Maven 3.9+ (or run from IntelliJ IDEA using Maven)

1. Start MySQL.
2. Create the database if desired:
   `CREATE DATABASE school_management;`
   The application can also create it automatically because `createDatabaseIfNotExist=true`.
3. Set your MySQL password. The default username is `root` and the default password is empty.
   - Windows PowerShell: `$env:MYSQL_PASSWORD="YOUR_PASSWORD"`
   - Or edit `backend/src/main/resources/application.properties`.
4. Open a terminal in `backend` and run:
   `mvn clean spring-boot:run`
5. Backend runs at `http://localhost:8080`.

The first startup creates/updates the tables automatically and seeds:
- Email: admin@school.com
- Password: Admin@123
- Role: ADMIN

## Frontend
1. Open a second terminal in `frontend`.
2. Run `npm install`
3. Run `npm run dev`
4. Open the URL printed by Vite, normally `http://localhost:5173`.

## Important fixes included
- Removed the hard-coded `YOUR_MYSQL_PASSWORD` failure point and made MySQL settings environment-configurable.
- Added MySQL driver configuration and Dar es Salaam timezone.
- Corrected student update so it updates the existing row instead of accidentally creating a new one.
- Added update/delete endpoints for teachers, subjects, attendance, results, payments and announcements.
- Improved login/register HTTP responses so invalid credentials and duplicate emails return proper status codes.
- Expanded CORS for localhost/127.0.0.1 development ports.
- Made frontend API URL configurable through `VITE_API_URL`.
