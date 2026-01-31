# Profile Completion Strategy - Implementation Plan

## Problem Statement

Users are registering but not completing their profiles with social network information (LinkedIn, Instagram, X/Twitter, WhatsApp, GitHub, email). This defeats the purpose of the application, which is to help classmates connect through shared contact information.

## Proposed Solution

Implement a **multi-layered encouragement strategy** that guides users to complete their profiles:

1. **Track profile completion status** in the database
2. **Show a persistent banner** on dashboard pages for incomplete profiles
3. **Redirect new users** to a dedicated "Complete Your Profile" page on first login
4. **Calculate completion percentage** based on filled social fields

---

## Proposed Changes

### Model Layer

#### [MODIFY] `src/models/user.ts`

Add new field to track profile completion:
```diff
+ profileCompleted: boolean  // true when user has filled at least 2 social fields
```

---

### API Layer

#### [MODIFY] `src/app/api/users/[id]/route.ts`

- Calculate `profileCompleted` when updating profile
- A profile is considered "complete" when user has filled **at least 2 social fields** (linkedin, instagram, twitter, whatsapp, github)

---

### Auth Layer

#### [MODIFY] `src/lib/auth.ts`

- Add `profileCompleted` to session data

---

### UI Components

#### [NEW] `src/components/layout/profile-completion-banner.tsx`

Create a prominent, dismissible banner component that:
- Shows completion percentage
- Has a clear CTA button to complete profile
- Can be temporarily dismissed (per session)
- Only shows for users with incomplete profiles

#### [MODIFY] `src/app/(dashboard)/layout.tsx`

- Include the `ProfileCompletionBanner` component
- Add logic to redirect users with `profileCompleted: false` to profile page on first visit

---

## Profile Completion Criteria

A profile is considered **complete** when the user has filled **at least 2** of the following fields:

| Field | Weight |
|-------|--------|
| `linkedin` | Required for professional networking |
| `whatsapp` | Essential for group communication |
| `instagram` | Popular social platform |
| `twitter` (X) | Professional/personal sharing |
| `github` | Technical networking |

> We intentionally set a low bar (2 fields) to reduce friction while still encouraging engagement.

---

## Verification Plan

### Manual Verification

1. **New User Registration Flow**:
   - Register a new account
   - Verify email and login
   - Confirm redirect to profile completion
   - Complete 2+ social fields
   - Verify banner disappears

2. **Existing User Flow**:
   - Login with existing account that has no social fields
   - Verify banner appears on dashboard
   - Complete profile
   - Verify banner disappears after refresh

3. **Dismiss Behavior**:
   - Dismiss banner
   - Navigate to another page
   - Verify banner stays dismissed for session
   - Refresh page / new session
   - Verify banner reappears

---

## Summary

This implementation provides a gentle but effective nudge for users to complete their profiles without being overly intrusive. The combination of first-login redirect and persistent banner ensures that users are consistently reminded of the value of sharing their contact information with classmates.
