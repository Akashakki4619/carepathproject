
-- Step 1: Drop the existing bad constraint first
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
