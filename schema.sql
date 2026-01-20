
-- Project D.I.R.E.C.T. - Database Schema for Neon PostgreSQL

-- 1. Teachers Table
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

-- 2. Tools Table (Assets)
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT UNIQUE,
    "condition" TEXT DEFAULT 'Good',
    "borrower" TEXT,
    "lastBorrowed" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Consumables Table (Lab Supplies)
CREATE TABLE IF NOT EXISTS consumables (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 0,
    "unit" TEXT,
    "expiryDate" DATE,
    "location" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT,
    "deadline" DATE,
    "status" TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Item Analysis Table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    "gradeLevel" INTEGER,
    "specialization" TEXT,
    "quarter" INTEGER,
    "totalQuestions" INTEGER,
    "responses" JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Deployment Tasks (Seeding)
-- Note: These will only insert if the task doesn't exist already to avoid duplication on schema updates
INSERT INTO tasks ("title", "assignedTo", "deadline", "status") 
SELECT 'Configure Neon DB Environment', 'System Admin', CURRENT_DATE + INTERVAL '1 day', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configure Neon DB Environment');

INSERT INTO tasks ("title", "assignedTo", "deadline", "status") 
SELECT 'Register Initial Faculty Profiles', 'Department Head', CURRENT_DATE + INTERVAL '3 days', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Register Initial Faculty Profiles');

INSERT INTO tasks ("title", "assignedTo", "deadline", "status") 
SELECT 'Perform Lab Equipment Inventory', 'Property Custodian', CURRENT_DATE + INTERVAL '7 days', 'Pending'
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Perform Lab Equipment Inventory');
