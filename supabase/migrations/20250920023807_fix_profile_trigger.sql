-- Fix the profile creation trigger to handle errors properly
-- This replaces the existing handle_new_user() function with better error handling

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_tenant_id uuid;
BEGIN
  -- Get tenant_id from user metadata
  user_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;

  -- Only create profile if we have a tenant_id
  IF user_tenant_id IS NOT NULL THEN
    INSERT INTO public.profiles (id, name, tenant_id, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      user_tenant_id,
      NOW(),
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();