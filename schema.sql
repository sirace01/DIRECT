
-- Project D.I.R.E.C.T. - Comprehensive Database Schema
-- Run this in your Neon SQL Editor to set up the environment.

-- 1. Laboratories (Parent Table)
CREATE TABLE IF NOT EXISTS laboratories (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "condition" TEXT DEFAULT 'Functional' CHECK ("condition" IN ('Functional', 'Maintenance', 'Closed')),
    "status" TEXT DEFAULT 'Available' CHECK ("status" IN ('Available', 'Occupied', 'Reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers Profile Registry
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

-- 3. Tools & Equipment (Linked to Lab)
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    "labId" INTEGER REFERENCES laboratories(id) ON DELETE SET NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT UNIQUE,
    "condition" TEXT DEFAULT 'Good' CHECK ("condition" IN ('Good', 'Fair', 'Defective', 'Under Maintenance')),
    "borrower" TEXT,
    "lastBorrowed" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Lab Consumables (Linked to Lab)
CREATE TABLE IF NOT EXISTS consumables (
    id SERIAL PRIMARY KEY,
    "labId" INTEGER REFERENCES laboratories(id) ON DELETE SET NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 0,
    "unit" TEXT,
    "expiryDate" DATE,
    "location" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Administrative Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT,
    "deadline" DATE,
    "status" TEXT DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'Done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Item Analysis Reports
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    "gradeLevel" INTEGER,
    "specialization" TEXT,
    "quarter" INTEGER,
    "totalQuestions" INTEGER,
    "responses" JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INITIAL SEEDING
INSERT INTO laboratories ("name", "building", "floor", "condition", "status")
VALUES 
('ICT Laboratory 1', 'ICT Building', '1st Floor', 'Functional', 'Available'),
('Computer Servicing Room', 'ICT Building', '2nd Floor', 'Functional', 'Available'),
('Electronics Lab', 'TVL Center', 'Ground Floor', 'Maintenance', 'Occupied')
ON CONFLICT DO NOTHING;

-- Seed a tool for the first lab
INSERT INTO tools ("labId", "name", "serialNumber", "condition")
SELECT 1, 'Oscilloscope', 'OSC-2024-X1', 'Good'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE "serialNumber" = 'OSC-2024-X1');

-- Seed a consumable for the first lab
INSERT INTO consumables ("labId", "name", "quantity", "unit", "expiryDate", "location")
SELECT 1, 'Solder Wire (Lead Free)', 50, 'rolls', '2027-01-01', 'Storage Cabinet B'
WHERE NOT EXISTS (SELECT 1 FROM consumables WHERE "name" = 'Solder Wire (Lead Free)');
