-- Script to setup professional account creation workflow
-- This creates a trigger that automatically creates user profile when auth.users is created

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_professional_user();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_professional_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile in public.users table
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    school_id,
    consent_given,
    notification_preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent'),
    NULL,
    true,
    jsonb_build_object('email', true, 'push', false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_professional_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
