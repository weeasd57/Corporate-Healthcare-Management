-- Single source code for both Company and Hospital

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

-- Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations (Companies & Hospitals)
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('company', 'hospital')),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    license_number VARCHAR(100), -- For hospitals
    contact_person VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    settings JSONB DEFAULT '{}', -- Custom settings for each org
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Company staff, Hospital staff, Employees)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL CHECK (role IN (
        'company_admin', 'company_hr', 'company_manager', 
        'hospital_admin', 'doctor', 'nurse', 'receptionist',
        'employee'
    )),
    department VARCHAR(100), -- For company employees
    position VARCHAR(100),
    employee_id VARCHAR(50), -- Company employee ID
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMPANY-HOSPITAL RELATIONSHIPS
-- =============================================

-- Contracts between companies and hospitals
CREATE TABLE company_hospital_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contract_number VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
    services_covered TEXT[], -- Array of covered services
    rates JSONB DEFAULT '{}', -- Pricing structure
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, hospital_id)
);

-- =============================================
-- MEDICAL RECORDS & HEALTH DATA
-- =============================================

-- Employee Medical Records
CREATE TABLE medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    blood_type VARCHAR(5),
    allergies TEXT[],
    chronic_conditions TEXT[],
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    health_status VARCHAR(20) DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'critical')),
    last_checkup_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Checkups & Examinations
CREATE TABLE checkups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES organizations(id),
    doctor_id UUID REFERENCES users(id),
    checkup_type VARCHAR(50) NOT NULL, -- 'annual', 'pre_employment', 'periodic', 'special'
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    results JSONB DEFAULT '{}', -- Flexible structure for different test results
    result_summary VARCHAR(20) CHECK (result_summary IN ('passed', 'failed', 'needs_followup')),
    doctor_notes TEXT,
    recommendations TEXT,
    next_checkup_date DATE,
    attachments TEXT[], -- URLs to uploaded files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SICK LEAVES & ABSENCES
-- =============================================

-- Sick Leave Requests
CREATE TABLE sick_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
    reason TEXT NOT NULL,
    medical_certificate_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    hr_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- APPOINTMENTS SYSTEM
-- =============================================

-- Appointments between companies and hospitals
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id),
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50) NOT NULL, -- 'checkup', 'consultation', 'followup'
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id), -- Who booked the appointment
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRESCRIPTIONS & MEDICINES
-- =============================================

-- Medicine inventory (for hospitals)
CREATE TABLE medicines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    category VARCHAR(100),
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    unit_of_measure VARCHAR(20), -- 'tablets', 'bottles', 'boxes'
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions
CREATE TABLE prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID REFERENCES appointments(id),
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prescription_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescription Items (Individual medicines in a prescription)
CREATE TABLE prescription_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id),
    medicine_name VARCHAR(255) NOT NULL, -- In case medicine is not in inventory
    dosage VARCHAR(100) NOT NULL, -- '1 tablet twice daily'
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BILLING & INVOICING
-- =============================================

-- Invoices for services provided
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    company_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (subtotal + tax_amount) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items (Services, checkups, medicines, etc.)
CREATE TABLE invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    description TEXT NOT NULL,
    item_type VARCHAR(30) NOT NULL, -- 'consultation', 'checkup', 'medicine', 'test'
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS SYSTEM
-- =============================================

-- System notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL, -- 'appointment', 'checkup_due', 'sick_leave', 'invoice'
    is_read BOOLEAN DEFAULT false,
    action_url TEXT, -- URL to navigate when clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Organization indexes
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);

-- Users indexes
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_id);
-- Ensure unique auth_id per user
ALTER TABLE public.users ADD CONSTRAINT users_auth_id_key UNIQUE(auth_id);

-- Medical records indexes
CREATE INDEX idx_medical_records_employee_id ON medical_records(employee_id);
CREATE INDEX idx_checkups_employee_id ON checkups(employee_id);
CREATE INDEX idx_checkups_hospital_id ON checkups(hospital_id);
CREATE INDEX idx_checkups_scheduled_date ON checkups(scheduled_date);

-- Appointments indexes
CREATE INDEX idx_appointments_employee_id ON appointments(employee_id);
CREATE INDEX idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Sick leaves indexes
CREATE INDEX idx_sick_leaves_employee_id ON sick_leaves(employee_id);
CREATE INDEX idx_sick_leaves_status ON sick_leaves(status);
CREATE INDEX idx_sick_leaves_date_range ON sick_leaves(start_date, end_date);

-- Invoice indexes
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_hospital_id ON invoices(hospital_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_hospital_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sick_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- DEV POLICIES: simplify to avoid uuid/text casting issues. Tighten later.

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth_id = auth.uid());

-- Allow authenticated users to select users within their organization
DROP POLICY IF EXISTS "users_select_by_org" ON users;
CREATE POLICY "users_select_by_org" ON users
  FOR SELECT
  TO authenticated
  USING (
    users.organization_id = COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid
  );

CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Allow anon users to insert into organizations table
CREATE POLICY "Allow anon insert to organizations" ON organizations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon select from organizations" ON organizations
    FOR SELECT USING (true);

-- Development: allow select all orgs
CREATE POLICY "orgs_select_all" ON organizations
  FOR SELECT USING (true);

-- Allow anon users to insert into users table (for initial admin user)
CREATE POLICY "Allow anon insert to users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "medrecs_select_all" ON medical_records
    FOR SELECT USING (true);

-- Similar policies for other tables...

CREATE POLICY "appointments_select_all" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "checkups_select_all" ON checkups
  FOR SELECT USING (true);

CREATE POLICY "sick_leaves_select_all" ON sick_leaves
  FOR SELECT USING (true);

-- =============================================
-- ADDITIONAL POLICIES TO ENABLE COMPANY/HOSPITAL ADMINS
-- TO MANAGE USERS AND MEDICAL RECORDS
-- =============================================

-- Allow authenticated company admins/HR/managers to insert users
-- within their own organization (auth_id can be NULL for employees
-- who haven't registered yet)
DROP POLICY IF EXISTS "users_insert_by_org_admins" ON users;
CREATE POLICY "users_insert_by_org_admins" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    users.organization_id = COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

-- Optionally allow org admins to update users in their organization
-- (kept permissive for DEV; tighten as needed)
DROP POLICY IF EXISTS "users_update_by_org_admins" ON users;
CREATE POLICY "users_update_by_org_admins" ON users
  FOR UPDATE
  TO authenticated
  USING (
    users.organization_id = COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  )
  WITH CHECK (
    users.organization_id = COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

-- Allow org admins to delete users in their organization
DROP POLICY IF EXISTS "users_delete_by_org_admins" ON users;
CREATE POLICY "users_delete_by_org_admins" ON users
  FOR DELETE
  TO authenticated
  USING (
    users.organization_id = COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

-- Allow authenticated org admins/medical staff to insert medical records
-- for employees in the same organization
DROP POLICY IF EXISTS "medrecs_insert_by_org_staff" ON medical_records;
CREATE POLICY "medrecs_insert_by_org_staff" ON medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = medical_records.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse')
  );

-- Allow authenticated users in the same org to select medical records
-- (DEV-friendly; tighten in production if needed)
DROP POLICY IF EXISTS "medrecs_select_by_org" ON medical_records;
CREATE POLICY "medrecs_select_by_org" ON medical_records
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = medical_records.employee_id
    )
  );

-- =============================================
-- Appointments policies (insert/update/delete) within organization
-- =============================================
DROP POLICY IF EXISTS "appointments_insert_by_org_staff" ON appointments;
CREATE POLICY "appointments_insert_by_org_staff" ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = appointments.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse','receptionist')
  );

DROP POLICY IF EXISTS "appointments_update_by_org_staff" ON appointments;
CREATE POLICY "appointments_update_by_org_staff" ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = appointments.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse','receptionist')
  )
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = appointments.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse','receptionist')
  );

DROP POLICY IF EXISTS "appointments_delete_by_org_staff" ON appointments;
CREATE POLICY "appointments_delete_by_org_staff" ON appointments
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = appointments.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse','receptionist')
  );

-- =============================================
-- Checkups policies
-- =============================================
DROP POLICY IF EXISTS "checkups_insert_by_org_staff" ON checkups;
CREATE POLICY "checkups_insert_by_org_staff" ON checkups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = checkups.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse')
  );

DROP POLICY IF EXISTS "checkups_update_by_org_staff" ON checkups;
CREATE POLICY "checkups_update_by_org_staff" ON checkups
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = checkups.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse')
  )
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = checkups.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse')
  );

DROP POLICY IF EXISTS "checkups_delete_by_org_staff" ON checkups;
CREATE POLICY "checkups_delete_by_org_staff" ON checkups
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = checkups.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin','doctor','nurse')
  );

-- =============================================
-- Sick leaves policies
-- =============================================
DROP POLICY IF EXISTS "sick_leaves_insert_by_org_staff" ON sick_leaves;
CREATE POLICY "sick_leaves_insert_by_org_staff" ON sick_leaves
  FOR INSERT
  TO authenticated
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = sick_leaves.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

DROP POLICY IF EXISTS "sick_leaves_update_by_org_staff" ON sick_leaves;
CREATE POLICY "sick_leaves_update_by_org_staff" ON sick_leaves
  FOR UPDATE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = sick_leaves.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  )
  WITH CHECK (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = sick_leaves.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

DROP POLICY IF EXISTS "sick_leaves_delete_by_org_staff" ON sick_leaves;
CREATE POLICY "sick_leaves_delete_by_org_staff" ON sick_leaves
  FOR DELETE
  TO authenticated
  USING (
    COALESCE(NULLIF((auth.jwt() -> 'user_metadata' ->> 'organization_id'), ''), '00000000-0000-0000-0000-000000000000')::uuid = (
      SELECT emp.organization_id FROM users AS emp WHERE emp.id = sick_leaves.employee_id
    )
    AND COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') IN ('company_admin','company_hr','company_manager','hospital_admin')
  );

-- =============================================
-- USEFUL FUNCTIONS
-- =============================================

-- Function to calculate employee age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming checkups
CREATE OR REPLACE FUNCTION get_upcoming_checkups(org_id UUID, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    employee_name TEXT,
    checkup_date TIMESTAMP WITH TIME ZONE,
    checkup_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(u.first_name, ' ', u.last_name) as employee_name,
        c.scheduled_date,
        c.checkup_type
    FROM checkups c
    JOIN users u ON c.employee_id = u.id
    WHERE u.organization_id = org_id
    AND c.scheduled_date >= NOW()
    AND c.scheduled_date <= NOW() + INTERVAL '1 day' * days_ahead
    AND c.status = 'scheduled'
    ORDER BY c.scheduled_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkups_updated_at BEFORE UPDATE ON checkups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sick_leaves_updated_at BEFORE UPDATE ON sick_leaves
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
