# Architecture

```text
Student mobile/desktop browser
  | Supabase Auth (email verification, session, password reset)
  | Feedback submission request
  v
Supabase Edge Function
  | verify user token + email confirmation
  | validate meal/date/ratings/comment
  | basic rate limit + duplicate check
  v
Postgres feedback table
  | Row Level Security restricts student rows
  | authority role can read aggregate/detail records
  v
Authority dashboard
  | average ratings by meal/category
  | low-rating follow-up list
  | CSV export
```

## Student flow
1. Sign in with verified email.
2. Choose breakfast, lunch, or dinner.
3. Rate taste, food quality, hygiene, and quantity from 1 to 5.
4. Optionally add a short comment.
5. Submit. The database allows one submission per student, meal, and date.
6. View their own recent submissions.

## Authority flow
1. Sign in with an authority role assigned by a trusted administrator.
2. Review meal and category averages.
3. Filter by meal and export records if needed.
4. Follow up on low-rated patterns. Ratings are signals, not proof that a complaint is true.

## Notes
- Browser code uses only the Supabase publishable/anon key. RLS is mandatory.
- Service-role credentials exist only in server-side Edge Function secrets.
- Database backup scheduling is configured at the provider/account level and must be verified separately.
- Analytics/error tracking are optional and should be configured to avoid collecting raw feedback or sensitive personal data.
