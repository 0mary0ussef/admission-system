-- Drop old tables (without 's') since we're using the more developed tables (with 's')
-- This script should be run manually in SQL Server Management Studio or Azure Data Studio

-- Drop foreign key constraints first
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_AdmissionProfile_Account')
    ALTER TABLE [AdmissionProfile] DROP CONSTRAINT [FK_AdmissionProfile_Account];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Login_Account')
    ALTER TABLE [Login] DROP CONSTRAINT [FK_Login_Account];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Account_AccountType')
    ALTER TABLE [Account] DROP CONSTRAINT [FK_Account_AccountType];

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_StudentExtension_Account')
    ALTER TABLE [StudentExtension] DROP CONSTRAINT [FK_StudentExtension_Account];

-- Drop old tables
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AdmissionProfile')
    DROP TABLE [AdmissionProfile];

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Login')
    DROP TABLE [Login];

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Account')
    DROP TABLE [Account];

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AccountType')
    DROP TABLE [AccountType];

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'StudentExtension')
    DROP TABLE [StudentExtension];

PRINT 'Old tables dropped successfully!'; 