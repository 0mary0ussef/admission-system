# School Admission Platform - Deployment Guide

## Backend (ASP.NET 8 Web API)

### 0) متطلبات السيرفر
- .NET 8 Hosting Bundle متسطب على السيرفر.
- Windows Features مفعلين:
  - IIS Management Console
  - Static Content
  - WebSocket Protocol (اختياري)
- لو مش مركّب Hosting Bundle هتشوف غالبًا HTTP Error 500.30.

### 1) نشر المشروع
- ضع نسخة الـ publish في مكان ثابت مثل: `C:\Sites\SchoolAdmission.Api\publish`.
- أنشئ فولدر `logs` جوّه الـ publish.

### 2) إعداد IIS
- Add Website:
  - Site name: `SchoolAdmission.Api`
  - Physical path: فولدر publish
  - Binding: http, Port: 5001
- Application Pool:
  - .NET CLR version: No Managed Code
  - Managed pipeline mode: Integrated
  - Start Mode: AlwaysRunning (اختياري)
  - Idle Time-out: 0 (اختياري)
- Permissions: IIS_IUSRS أو AppPool identity صلاحية Modify على فولدر publish و logs.

### 3) web.config
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
    </handlers>
    <aspNetCore processPath="dotnet" 
                arguments=".\SchoolAdmission.dll" 
                stdoutLogEnabled="true" 
                stdoutLogFile=".\logs\stdout" 
                hostingModel="inprocess">
      <environmentVariables>
        <environmentVariable name="ASPNETCORE_ENVIRONMENT" value="Production" />
      </environmentVariables>
    </aspNetCore>
  </system.webServer>
</configuration>



--SQL, ConnectionString
4) Connection String
استخدم SQL Auth:
"DefaultConnection": "Data Source=DESKTOP-S0FL0T4\\SQLEXPRESS;Initial Catalog=ElsewedySchoolSys;User ID=school_user;Password=StrongPass123!;TrustServerCertificate=True"
SQL Server لازم يكون على Mixed Mode والمستخدم له صلاحية db_owner.

5) تشغيل وتجربة
افتح: http://localhost:5001/swagger أو أي Endpoint API.







----Front End
Frontend (React)
1) إعداد config.js

Production API URL يجب أن يشير للـ Backend على IIS:

production: {
  apiBaseUrl: "http://localhost:5001/api",
  timeout: 15000,
  enableDebugLogs: false,
}



webConfig in Front
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- API Proxy - redirect /api/* to backend -->
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:5253/api/{R:1}" />
        </rule>
        
        <!-- SPA Routes - redirect all non-file requests to index.html -->
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>







4) إعداد IIS

Add Website:
Site name: SchoolAdmission.Web
Physical path: فولدر build
Binding: http, Port: 5002
افتح الموقع: http://localhost:5002/


5) ربط Frontend بالBackend
Backend على: http://localhost:5001/api
Frontend على: http://localhost:5002/
CORS مفعّل على الـ API يسمح لكل الـ origins.




Checklist نهائي
Hosting Bundle .NET 8 متسطب
Backend publish في مسار ثابت + AppPool = No Managed Code
ASPNETCORE_ENVIRONMENT=Production في web.config
Permissions: Modify على publish و logs
Connection String بـ SQL Auth شغّال
Frontend config.js Production URL صحيح
npm run build + web.config للـ React
URL Rewrite + Static Content مفعلين

