-- Update Sections to have the correct 5 sections
-- This script will clear existing sections and add the correct ones

-- Clear existing sections (be careful with this in production!)
DELETE FROM ExamQuestion;
DELETE FROM Section;

-- Reset identity for Section table
DBCC CHECKIDENT ('Section', RESEED, 0);

-- Insert the correct 5 sections
INSERT INTO Section (SectionName) VALUES 
('Arabic'),
('Software'), 
('English'),
('MathAR'),
('MathEN');

-- Verify the sections were created correctly
SELECT * FROM Section;
