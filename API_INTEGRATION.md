# API Integration Documentation

This document describes the API integration changes made to connect the React frontend to the .NET Web API backend.

## Overview

The frontend has been updated to use real API calls instead of mock data. All HTTP requests are now handled through a centralized API service using Axios.

## API Service Structure

### Base Configuration (`src/utils/api.js`)

- **Base URL**: `http://localhost:5000/api` (configurable)
- **Timeout**: 10 seconds
- **Authentication**: Automatic token injection via request interceptors
- **Error Handling**: Automatic 401 handling with token cleanup and redirect

### API Endpoints

#### Authentication

- `POST /api/Auth/teacher/login` - Teacher login
- `POST /api/Auth/admin/login` - Admin login

#### Teacher Operations

- `POST /api/Teacher/register-student` - Register new student

#### Student Operations

- `GET /api/Student/validate/{nationalId}` - Validate national ID
- `POST /api/Student/complete-info` - Complete student information
- `POST /api/Student/upload-document` - Upload documents
- `GET /api/Student/validate-exam/{nationalId}` - Validate for exam
- `POST /api/Student/submit-exam` - Submit exam results

#### Admin Operations

- `GET /api/Admin/students` - Get all students
- `GET /api/Admin/students/filter` - Filter students
- `POST /api/Admin/student/{studentId}/my-interview-score` - Set interview score
- `PUT /api/Admin/student/{studentId}/status` - Update student status

#### Exam Operations

- `GET /api/Exam/student/{nationalId}` - Get exam results

## Updated Pages

### 1. RegisterStudentPage

- **API**: `POST /api/Teacher/register-student`
- **Data**: Student registration information
- **Features**: Form validation, error handling, success messages

### 2. CheckNationalIdPage

- **API**: `GET /api/Student/validate/{nationalId}`
- **Features**: National ID validation, redirect to completion form

### 3. CompleteStudentInfoPage

- **APIs**:
  - `POST /api/Student/upload-document` (multiple calls for documents)
  - `POST /api/Student/complete-info`
- **Features**: File uploads, form validation, progress tracking

### 4. VerifyStudentPage

- **API**: `GET /api/Student/validate-exam/{nationalId}`
- **Features**: Exam eligibility validation

### 5. ExamPage

- **API**: `POST /api/Student/submit-exam`
- **Features**: Exam submission with scores calculation

### 6. AdminDashboardPage

- **APIs**:
  - `GET /api/Admin/students`
  - `POST /api/Admin/student/{studentId}/my-interview-score`
  - `PUT /api/Admin/student/{studentId}/status`
- **Features**: Student management, interview scoring, status updates

### 7. TeacherLoginPage & AdminLoginPage

- **APIs**: Respective login endpoints
- **Features**: Authentication, token storage, redirect handling

## Authentication Flow

1. **Login**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage
3. **Automatic Injection**: Token automatically added to all subsequent requests
4. **Token Refresh**: Handled by backend (24-hour expiry)
5. **Logout**: Token removed from localStorage

## Error Handling

### Network Errors

- Connection timeouts
- Server unavailability
- Network connectivity issues

### API Errors

- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found (resource doesn't exist)
- 500: Server Error (backend issues)

### User Feedback

- Loading states during API calls
- Error messages for failed operations
- Success confirmations for completed actions

## File Upload

### Supported Formats

- Images: JPG, JPEG, PNG
- Documents: PDF
- Maximum size: 10MB per file

### Upload Process

1. File validation (type, size)
2. FormData creation
3. Multipart upload to server
4. File path storage in database

## Data Flow

### Student Registration Flow

1. Teacher registers student → `POST /api/Teacher/register-student`
2. Student validates national ID → `GET /api/Student/validate/{nationalId}`
3. Student completes info → `POST /api/Student/complete-info`
4. Student uploads documents → `POST /api/Student/upload-document`
5. Student takes exam → `POST /api/Student/submit-exam`
6. Admin reviews and scores → Various admin endpoints

## Security Features

- JWT token authentication
- Automatic token injection
- Token cleanup on 401 errors
- Secure file upload validation
- Input sanitization and validation

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:5000/api)

### Backend Requirements

- CORS enabled for frontend domain
- JWT token validation
- File upload endpoint with proper validation
- Database connection and migrations

## Testing

### API Testing

- All endpoints tested with real backend
- Error scenarios handled
- File upload functionality verified
- Authentication flow validated

### Frontend Testing

- Form validation working
- Loading states displayed
- Error messages shown
- Success flows completed

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured
2. **401 Errors**: Check token validity and storage
3. **File Upload Failures**: Verify file size and type restrictions
4. **Network Timeouts**: Check API base URL and server availability

### Debug Steps

1. Check browser network tab for failed requests
2. Verify API base URL configuration
3. Check authentication token in localStorage
4. Review backend logs for server-side errors
