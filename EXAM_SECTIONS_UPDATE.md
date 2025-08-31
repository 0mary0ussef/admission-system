# Exam Sections Update

## المشكلة
كان هناك مشكلة في الـ Logic الخاص بـ Exam Sections حيث كان يتم التعامل مع Math فقط بدلاً من MathEN و MathAR بشكل منفصل.

## الحل
تم تحديث الـ Logic ليدعم 5 sections صحيحة:

### Sections الجديدة:
1. **Arabic** - أسئلة اللغة العربية
2. **Software** - أسئلة البرمجة والكمبيوتر
3. **English** - أسئلة اللغة الإنجليزية
4. **MathAR** - أسئلة الرياضيات باللغة العربية (للمدارس العربية)
5. **MathEN** - أسئلة الرياضيات باللغة الإنجليزية (للمدارس اللغات)

### التغييرات في Backend:

#### 1. ExamController.cs
- **GetQuestionsBySectionWithSchoolType**: تم تحديث الـ Logic ليتعامل مع MathEN و MathAR بشكل منفصل
- **GetSectionsWithSchoolType**: تم تحديث الـ Logic ليرجع الـ sections الصحيحة حسب نوع المدرسة
- **CalculateAndUpdateResults**: تم تحديث الـ Logic لحساب النتائج بشكل صحيح

#### 2. Logic الجديد:
```csharp
// للطلاب من مدارس عربي
if (schoolType == "عربي") {
    // يظهر: Arabic, Software, English, MathAR
}

// للطلاب من مدارس لغات  
if (schoolType == "لغات") {
    // يظهر: Arabic, Software, English, MathEN
}
```

### التغييرات في Frontend:

#### 1. ExcelUploadPage.jsx
- تم تحديث الـ template ليتعامل مع MathEN بدلاً من Math
- تم تحديث الـ documentation

#### 2. GetExamPage.jsx
- الـ Frontend يتعامل مع MathAR بشكل صحيح (RTL layout)
- MathEN يستخدم LTR layout

### Database Update:
تم إنشاء ملف SQL script (`update_sections.sql`) لتحديث الـ Database:

```sql
-- Clear existing sections
DELETE FROM ExamQuestion;
DELETE FROM Section;

-- Insert the correct 5 sections
INSERT INTO Section (SectionName) VALUES 
('Arabic'),
('Software'), 
('English'),
('MathAR'),
('MathEN');
```

## كيفية التطبيق:

1. **تشغيل SQL Script**:
   ```bash
   # في SQL Server Management Studio أو أي tool آخر
   # تشغيل ملف update_sections.sql
   ```

2. **إعادة تشغيل Backend**:
   ```bash
   cd server/SchoolAdmission
   dotnet run
   ```

3. **اختبار النظام**:
   - تسجيل دخول كـ SuperAdmin
   - رفع أسئلة جديدة لكل section
   - اختبار الامتحان مع طلاب من مدارس مختلفة

## ملاحظات مهمة:
- تأكد من وجود أسئلة في كل section قبل اختبار النظام
- الـ logging تم إضافته للمساعدة في debugging
- النظام الآن يدعم 5 sections منفصلة بدلاً من 4
