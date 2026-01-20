
-- Project D.I.R.E.C.T. - Database Schema for Neon PostgreSQL

-- 1. Laboratories Table: Manage physical lab rooms
CREATE TABLE IF NOT EXISTS laboratories (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "condition" TEXT DEFAULT 'Functional' CHECK ("condition" IN ('Functional', 'Maintenance', 'Closed')),
    "status" TEXT DEFAULT 'Available' CHECK ("status" IN ('Available', 'Occupied', 'Reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Teachers Table
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

-- 3. Tools Table: Linked to laboratories
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

-- 4. Consumables Table: Linked to laboratories
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

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT,
    "deadline" DATE,
    "status" TEXT DEFAULT 'Pending' CHECK ("status" IN ('Pending', 'Done')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Item Analysis Table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    "gradeLevel" INTEGER,
    "specialization" TEXT,
    "quarter" INTEGER,
    "totalQuestions" INTEGER,
    "responses" JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
INSERT INTO laboratories ("name", "building", "floor", "condition", "status")
VALUES 
('Computer Laboratory 1', 'Science Building', '1st Floor', 'Functional', 'Available'),
('Computer Laboratory 2', 'Science Building', '2nd Floor', 'Functional', 'Available'),
('Electronics Lab', 'TVL Building', 'Ground Floor', 'Maintenance', 'Occupied')
ON CONFLICT DO NOTHING;

INSERT INTO teachers ("firstName", "lastName", "empNo", "dob", "subjectTaught", "position", "educationBS")
SELECT 'Maria', 'Santos', 'EMP-2024-001', '1985-05-15', 'Computer Systems Servicing', 'Teacher III', 'BS Information Technology'
WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE "empNo" = 'EMP-2024-001');

INSERT INTO tools ("labId", "name", "serialNumber", "condition")
SELECT 1, 'Digital Multimeter', 'DMM-SN-9921', 'Good'
WHERE NOT EXISTS (SELECT 1 FROM tools WHERE "serialNumber" = 'DMM-SN-9921');

INSERT INTO consumables ("labId", "name", "quantity", "unit", "expiryDate", "location")
SELECT 1, 'Cat6 UTP Cable', 200, 'meters', '2026-12-31', 'Cabinet A'
WHERE NOT EXISTS (SELECT 1 FROM consumables WHERE "name" = 'Cat6 UTP Cable');
