
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

-- 2. Tools Table
CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT UNIQUE,
    "condition" TEXT DEFAULT 'Good',
    "borrower" TEXT,
    "lastBorrowed" TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Consumables Table
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

-- Seed basic data (optional)
INSERT INTO tasks ("title", "assignedTo", "deadline", "status") 
VALUES ('System Initial Deployment', 'Principal', CURRENT_DATE + INTERVAL '7 days', 'Pending')
ON CONFLICT DO NOTHING;
