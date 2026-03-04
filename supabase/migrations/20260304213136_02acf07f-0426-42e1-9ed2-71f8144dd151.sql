
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS gender text DEFAULT '',
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS udid_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS guardian_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS guardian_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS work_experience_years integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS preferred_job_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS preferred_locations text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS bio text DEFAULT '',
  ADD COLUMN IF NOT EXISTS linkedin_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS assistive_tech text DEFAULT '',
  ADD COLUMN IF NOT EXISTS emergency_contact_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS marital_status text DEFAULT '',
  ADD COLUMN IF NOT EXISTS pincode text DEFAULT '';
