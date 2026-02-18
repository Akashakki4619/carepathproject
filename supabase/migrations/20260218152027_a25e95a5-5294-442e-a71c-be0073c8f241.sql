
-- Fix existing invalid role values in profiles
UPDATE public.profiles SET role = 'ambulance_driver' WHERE role = 'driver';
UPDATE public.profiles SET role = 'ambulance_driver' WHERE role NOT IN ('admin', 'hospital_staff', 'ambulance_driver', 'dispatcher');

-- Re-add the constraint with correct valid roles
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'hospital_staff', 'ambulance_driver', 'dispatcher'));
