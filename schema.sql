-- Project D.I.R.E.C.T. - Database Schema for Neon PostgreSQL

-- 1. Teachers Table: Stores faculty profiles and professional qualifications
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "empNo" TEXT UNIQUE NOT NULL,
    "contact" TEXT,
    "address" TEXT,
    "dob" DATE NOT NULL,
    "subjectTaught" TEXT,
    "yearsTeachingSubject" INTEGER DEFAULT 0,
    "tesdaQualifications" TEXT[] DEFAULT '{}',
    "position" TEXT,
    "educationBS" TEXT,
    "educationMA" TEXT,
    "educationPhD" TEXT,
    "yearsInService" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tools Table: Tracking for physical lab assets and equipment
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT UNIQUE,
    "condition" TEXT DEFAULT 'Good' CHECK ("condition" IN ('Good', 'Fair', 'Defective', 'Under Maintenance')),
    "borrower" TEXT,
    "lastBorrowed" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Consumables Table: Inventory for school/lab supplies with expiry tracking
CREATE TABLE IF NOT EXISTS consumables (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 0,
    "unit" TEXT,
    "expiryDate" DATE,
    "location" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tasks Table: Administrative workflow tracking
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT,
    "deadline" DATE,
    "status" TEXT DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'Done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Item Analysis Table: Stores student performance data for mastery tracking
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    "gradeLevel" INTEGER,
    "specialization" TEXT,
    "quarter" INTEGER,
    "totalQuestions" INTEGER,
    "responses" JSONB, -- Stores per-question performance metrics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA: Initial records for system demonstration
INSERT INTO teachers ("firstName", "lastName", "empNo", "dob", "subjectTaught", "position", "educationBS")
SELECT 'Maria', 'Santos', 'EMP-2024-001', '1985-05-15', 'Computer Systems Servicing', 'Teacher III', 'BS Information Technology'
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE "empNo" = 'EMP-2024-001');

INSERT INTO tools ("name", "serialNumber", "condition")
SELECT 'Digital Multimeter', 'DMM-SN-9921', 'Good'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE "serialNumber" = 'DMM-SN-9921');

INSERT INTO consumables ("name", "quantity", "unit", "expiryDate", "location")
SELECT 'Cat6 UTP Cable', 200, 'meters', '2026-12-31', 'Cabinet A'
WHERE NOT EXISTS (SELECT 1 FROM consumables WHERE "name" = 'Cat6 UTP Cable');

INSERT INTO tasks ("title", "assignedTo", "deadline", "status") 
SELECT 'Configure Neon DB Environment', 'System Admin', CURRENT_DATE + INTERVAL '1 day', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configure Neon DB Environment');
