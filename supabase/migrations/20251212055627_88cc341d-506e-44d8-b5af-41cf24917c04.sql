-- Fix the email_change NULL issue in auth.users
UPDATE auth.users 
SET email_change = ''
WHERE email_change IS NULL;