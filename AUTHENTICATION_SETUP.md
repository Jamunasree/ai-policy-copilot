# Authentication & History Setup Guide

This document explains how to set up authentication and the history feature for the AI Policy Copilot.

## Setup Instructions

### 1. Supabase Database Migration

Run the SQL migration to create the `compliance_analyses` table:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase dashboard:
# Go to SQL Editor → Create new query → Copy contents of supabase/migrations/001_create_compliance_analyses.sql
```

### 2. Environment Variables

Ensure your `.env.local` file has these Supabase variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### 3. Enable Email Authentication in Supabase

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable "Email" provider
3. Configure email templates if needed

## Features Added

### Authentication System
- **Login/Signup Pages**: User authentication with email and password
- **Session Management**: Persistent sessions using Supabase Auth
- **Protected Routes**: Only authenticated users can access analysis and history pages

### New Pages
- `/auth` - Login/Signup page
- `/home` - Dashboard with quick links to start analysis or view history
- `/analyze` - Compliance analysis tool (moved from `/`)
- `/history` - View all previous analyses

### History Feature
- **Store Analyses**: Save each analysis with metadata (date, file name, results)
- **View History**: See all previous analyses in a table
- **Delete Records**: Remove specific analyses
- **View Details**: Click to see full details of any past analysis

### Components
- **Login.tsx** - Email/password login form
- **Signup.tsx** - User registration form
- **useAuth.ts** - Custom hook for authentication state
- **Header.tsx** (updated) - Now shows user menu and navigation

## Database Schema

### compliance_analyses Table
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key to auth.users)
- file_name (TEXT)
- document_text (TEXT)
- covered (TEXT[])
- missing (TEXT[])
- reasoning (JSONB)
- generated_policies (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Row Level Security**: Enabled
- Users can only view/edit/delete their own analyses

## Usage Flow

1. **User Registration**
   - Navigate to `/auth`
   - Click "Sign up here"
   - Enter email and password
   - Account is created (check email for confirmation if enabled)

2. **Login**
   - Navigate to `/auth`
   - Enter credentials
   - Redirected to `/home` dashboard

3. **Start Analysis**
   - Click "New Analysis" on home page or in header menu
   - Navigate to `/analyze`
   - Upload PDF and perform analysis as usual
   - Results show "Save to History" button

4. **Save Analysis**
   - After analysis completes, click "Save to History"
   - Analysis is saved with full context

5. **View History**
   - Click "View History" in header menu or on home page
   - See all previous analyses
   - Click "View Details" to see full results
   - Click "Delete" to remove an analysis

## API Integration

### Save Analysis (complianceStore.ts)
```typescript
await saveAnalysis(user.id);
```

Saves current analysis to database with:
- Document metadata
- Compliance results (covered, missing, reasoning)
- Generated policies
- Timestamp

### Fetch History (History.tsx)
```typescript
const { data } = await supabase
  .from('compliance_analyses')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

## Security Considerations

1. **Row Level Security**: All queries are filtered by `user_id`
2. **Session Persistence**: Supabase Auth handles secure token storage
3. **Email Verification**: Optional - can be configured in Supabase
4. **Password Security**: Bcrypt hashing by Supabase (automatic)

## Testing

1. Create a test account
2. Upload a PDF and perform analysis
3. Click "Save to History"
4. Navigate to `/history` and verify the analysis appears
5. Click "View Details" to verify all data is saved correctly
6. Test logout and login with same account
7. Verify history is persistent across sessions

## Troubleshooting

### "Not authenticated" errors
- Check that Supabase Auth is enabled
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are correct

### History not showing
- Check Supabase RLS policies are enabled
- Verify user_id in compliance_analyses matches auth.users

### Logout not working
- Clear browser localStorage: `localStorage.clear()`
- Check Supabase auth session

## Future Enhancements

- [ ] Email verification on signup
- [ ] Password reset functionality
- [ ] Share analyses with team members
- [ ] Analysis exports (PDF, Word, JSON)
- [ ] Bulk operations on history
- [ ] Search/filter history by date or control
- [ ] Analysis comparison tool
