-- SCRIPT: Setup Professional Types System
-- Adds professionalType field to differentiate docente from psicopedagogo

-- Add professional_type column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS professional_type TEXT CHECK (professional_type IN ('docente', 'psicopedagogo'));

-- Update existing psychopedagogists to have professional_type
UPDATE users 
SET professional_type = 'psicopedagogo' 
WHERE role = 'psychopedagogist' AND professional_type IS NULL;

-- Update existing teachers to have professional_type
UPDATE users 
SET professional_type = 'docente' 
WHERE role = 'teacher' AND professional_type IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_professional_type ON users(professional_type);

-- Add clinical_notes column to students table (only visible to psicopedagogos)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS clinical_notes JSONB DEFAULT '[]'::jsonb;

-- Add observations column to students table (visible to both)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS observations JSONB DEFAULT '[]'::jsonb;

-- RLS Policy: Only psicopedagogos can see clinical_notes
CREATE POLICY "Psicopedagogos see clinical notes" ON students
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE professional_type = 'psicopedagogo' 
    AND id = students.psychopedagogist_id
  )
);

COMMENT ON COLUMN users.professional_type IS 'Tipo de profesional: docente (seguimiento básico) o psicopedagogo (evaluación completa + intervención)';
COMMENT ON COLUMN students.clinical_notes IS 'Notas clínicas privadas - Solo visible para psicopedagogos';
COMMENT ON COLUMN students.observations IS 'Observaciones pedagógicas - Visible para docentes y psicopedagogos';
