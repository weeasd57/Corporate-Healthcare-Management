-- 1) Drop all policies in public schema (handles unknown/old names)
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 2) Drop all tables (CASCADE removes dependent objects/indexes and triggers)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS sick_leaves CASCADE;
DROP TABLE IF EXISTS checkups CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS company_hospital_contracts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 3) Drop helper functions
DROP FUNCTION IF EXISTS calculate_age(DATE) CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_checkups(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
