CREATE DATABASE nurse_roster;

-- Users Table (Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'nurse',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Nurses Profile Table (1:1 with Users)
CREATE TABLE nurses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(50),
    designation VARCHAR(100),
    institution VARCHAR(255),
    ward VARCHAR(50),
    salary_number VARCHAR(50),
    basic_salary DECIMAL(10, 2),
    ot_rate DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts Table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nurse_id UUID REFERENCES nurses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shifts JSONB DEFAULT '[]', -- Stores ["M", "DN"] etc.
    type VARCHAR(50), -- Stores "DO", "PH", "VL", etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nurse_id, date)
);

-- Indexes for Performance
CREATE INDEX idx_shifts_nurse_id ON shifts(nurse_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_nurses_ward ON nurses(ward);
