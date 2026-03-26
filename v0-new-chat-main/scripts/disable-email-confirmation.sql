-- Disable email confirmation requirement for Supabase Auth
-- This allows users to login immediately after registration

-- IMPORTANT: Run this configuration in Supabase Dashboard
-- Go to: Authentication > Email Auth > Confirm email = OFF

-- Or use Supabase CLI:
-- supabase auth update --enable-signup --confirm-email=false

-- This script is for documentation purposes
-- The actual setting must be changed in Supabase Dashboard or CLI
