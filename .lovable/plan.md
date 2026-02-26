

## Diagnostic Results

### What IS working
- Database: All 9 tables are correctly provisioned (profiles, properties, jobs, employees, inventory, cleaning_reports, report_rooms, report_photos, user_roles)
- Storage: Both buckets (cleaning-photos, report-photos) exist and are public
- Triggers: `on_auth_user_created` is active on auth.users, auto-creating profile + role on signup
- RLS: All policies are correctly applied
- The migration ran successfully -- the database is complete

### Root Cause of Login Failure

Both registered accounts (`kamila13petters@gmail.com` and `marcioasoliveira@hotmail.com`) have **`email_confirmed_at = NULL`**. The authentication system requires email confirmation before allowing login. This is why every login attempt returns "Invalid login credentials" or "Email not confirmed".

This is NOT a database or migration issue -- the schema is fully intact.

### Secondary Issue

`CalendarSyncSection.tsx` still references the old project URL (`okgqcakjjkbijcuaevgx`) instead of the current one (`ebafqcanwdqomqcrifrj`).

---

## Plan

### Step 1 -- Enable auto-confirm for email signups

Use the `configure-auth` tool to enable automatic email confirmation. This will:
- Allow existing unconfirmed users to sign in immediately after re-registering or resetting password
- Allow future signups to work without email verification delays

### Step 2 -- Confirm existing users via SQL

Run an UPDATE on `auth.users` to set `email_confirmed_at = now()` for the two existing unconfirmed accounts so they can log in immediately with their current passwords.

### Step 3 -- Fix CalendarSyncSection URL

Update `src/components/CalendarSyncSection.tsx` to use `import.meta.env.VITE_SUPABASE_URL` instead of the hardcoded old project URL.

### Step 4 -- Improve login error messages

Update `src/pages/auth/Login.tsx` to translate common backend error codes (`email_not_confirmed`, `invalid_credentials`) into clear Portuguese messages instead of showing raw English error text.

---

### Files to edit

| File | Action |
|---|---|
| Auth config | Configure auto-confirm via tool |
| `auth.users` table | Update `email_confirmed_at` for existing users |
| `src/components/CalendarSyncSection.tsx` | Fix hardcoded URL |
| `src/pages/auth/Login.tsx` | Better error messages in Portuguese |

### Technical details

The `configure-auth` tool will set `enable_signup = true` and auto-confirm emails. The SQL update will use `UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL` to unlock existing accounts. The CalendarSyncSection fix will use `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-feed` for portability.

