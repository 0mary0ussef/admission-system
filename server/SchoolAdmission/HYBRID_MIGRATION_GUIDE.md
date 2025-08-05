# Hybrid Database Migration Guide

## Overview

This document outlines the implementation of a hybrid database migration for the School Admission System, allowing the application to work with both the original custom models and the new ElsewedySchoolSys database structure simultaneously.

## Current State

### Scaffolded Models (from ElsewedySchoolSys)

- `Account.cs` - Central user table for all users
- `Login.cs` - Authentication credentials linked to Account
- `AdmissionProfile.cs` - Base admission data linked to Account
- `StudentExtension.cs` - Student-specific attributes
- `AccountType.cs` - User type classification

### Original Models (still in use by controllers)

- `Student.cs` - Custom student model with all admission fields
- `Teacher.cs` - Custom teacher model
- `Admin.cs` - Custom admin model
- `Exam.cs` - Custom exam model (different from what we need)
- `InterviewScore.cs` - Custom interview scoring

### New Project-Specific Models

- `Section.cs` - Exam subjects (Arabic, English, Math, Software)
- `ExamQuestion.cs` - Individual questions with multiple choice answers
- `StudentExamResults.cs` - Final scores per subject
- `StudentExamAnswers.cs` - Individual student answers per question

## Implementation Details

### 1. Updated DbContext

The `SchoolAdmissionDbContext` now includes both old and new models:

```csharp
public class SchoolAdmissionDbContext : DbContext
{
    // Scaffolded models from ElsewedySchoolSys database
    public DbSet<Account> Accounts { get; set; }
    public DbSet<Login> Logins { get; set; }
    public DbSet<AdmissionProfile> AdmissionProfiles { get; set; }
    public DbSet<StudentExtension> StudentExtensions { get; set; }
    public DbSet<AccountType> AccountTypes { get; set; }

    // Original models (still needed for controllers)
    public DbSet<Student> Students { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<Admin> Admins { get; set; }
    public DbSet<Exam> Exams { get; set; }
    public DbSet<InterviewScore> InterviewScores { get; set; }

    // New project-specific models
    public DbSet<Section> Sections { get; set; }
    public DbSet<ExamQuestion> ExamQuestions { get; set; }
    public DbSet<StudentExamResults> StudentExamResults { get; set; }
    public DbSet<StudentExamAnswers> StudentExamAnswers { get; set; }
}
```

### 2. Model Relationships

Configured relationships in `OnModelCreating`:

- `ExamQuestion` → `Section` (many-to-one)
- `StudentExamResults` → `Account` (one-to-one)
- `StudentExamAnswers` → `Account` and `ExamQuestion` (many-to-one)
- `AdmissionProfile` → `Account` (one-to-one)
- `StudentExtension` → `Account` (one-to-one)

### 3. Data Transfer Service

Created `DataTransferService` to handle migration between old and new models:

```csharp
public class DataTransferService
{
    public async Task<Account> CreateAccountFromStudent(Student student)
    public async Task<Account> CreateAccountFromTeacher(Teacher teacher)
    public async Task<Account> CreateAccountFromAdmin(Admin admin)
    public async Task<StudentExamResults> CreateExamResultsFromStudent(Student student, Account account)
}
```

### 4. Authentication Service

**Updated**: AuthController now uses only the new Account/Login system directly, removing the hybrid authentication approach for simplicity.

## Migration Strategy

### Phase 1: Database Setup ✅

- [x] Updated DbContext with both old and new models
- [x] Created migration for new tables
- [x] Configured model relationships
- [x] Removed StatusId references (not using Status table from ElsewedySchoolSys)

### Phase 2: Data Transfer Logic ✅

- [x] Created DataTransferService for migrating data between models
- [x] Created AuthenticationService for hybrid authentication
- [x] Registered services in dependency injection

### Phase 3: Controller Updates (Next Steps)

- [x] Update AuthController to use hybrid authentication
- [x] Update StudentController to work with both old and new models
- [x] Update AdminController to work with both old and new models
- [x] Update TeacherController to work with both old and new models
- [x] Update ExamController to use new exam system

### Phase 4: Gradual Migration

- [ ] Migrate existing data from old models to new structure
- [ ] Test all functionality with hybrid approach
- [ ] Gradually remove old model dependencies
- [ ] Clean up old models and tables

## Key Features

### 1. Backward Compatibility

- All existing controllers continue to work with old models
- No breaking changes to existing functionality
- Gradual migration path

### 2. New Exam System

- Question-based exams with multiple choice answers
- Section-based organization (Arabic, English, Math, Software)
- Individual student answer tracking
- Automated score calculation

### 3. Unified Authentication

- ~~Single authentication endpoint that works with both systems~~
- ~~Automatic fallback to old system if new system fails~~
- ~~Support for all user types (Admin, Teacher, Student)~~
- **Updated**: Direct authentication using Account/Login tables only
- Support for all user types (Admin, Teacher, Student) through AccountType

### 4. Data Migration Tools

- Automated data transfer from old models to new structure
- Preserves all existing data during migration
- Safe rollback capabilities

## Usage Examples

### Authentication

```csharp
// ~~Works with both old and new systems~~
// ~~var user = await authService.AuthenticateUser(email, password, "admin");~~

// Direct authentication with Account/Login tables
var login = await db.Logins
    .Include(l => l.Account)
    .ThenInclude(a => a.AccountType)
    .FirstOrDefaultAsync(l => l.Email == email);

if (login != null && BCrypt.Net.BCrypt.Verify(password, login.PasswordHash))
{
    // User authenticated successfully
    var role = login.Account.AccountType.AccountTypeName;
}
```

### Data Migration

```csharp
// Migrate a student to the new system
var account = await dataTransferService.CreateAccountFromStudent(student);
```

### Exam Management

```csharp
// Create new exam questions
var examQuestion = new ExamQuestion
{
    QuestionTitle = "What is 2 + 2?",
    Choice1 = "3",
    Choice2 = "4",
    Choice3 = "5",
    Choice4 = "6",
    CorrectAnswer = "4",
    SectionId = 1 // Math section
};
```

## Next Steps

1. **Apply Migration**: Run `dotnet ef database update` to create new tables
2. **Update Controllers**: Gradually update controllers to use hybrid approach
3. **Test Thoroughly**: Ensure all functionality works with both systems
4. **Migrate Data**: Use DataTransferService to migrate existing data
5. **Remove Old Models**: Once migration is complete, remove old models

## Notes

- The Status table from ElsewedySchoolSys is not used; custom status management is implemented
- All new tables are added to the ElsewedySchoolSys database
- Existing data in ElsewedySchoolSys is preserved
- The migration is designed to be reversible if needed
