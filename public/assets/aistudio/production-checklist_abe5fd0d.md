# Production checklist

## Launch gate
- Launch only after the custom domain is connected, HTTPS works, and auth redirects use that domain.
- Verify favicon, title, metadata, privacy policy, terms, and custom 404 route.
- Remove any platform or AI-builder branding before public launch.
- Do not use fake reviews, fake usage counters, or fabricated claims.

## Authentication
- Enable email verification in Supabase Auth.
- Configure exact Site URL and allowed redirect URLs.
- Test sign-up, verification, sign-in, sign-out, password reset, expired links, and unverified users.
- Add a server-side role assignment procedure for authorities.
- Do not let users update their own role.

## Data security
- Run `supabase/schema.sql`.
- Test RLS with at least two students and one authority account.
- Verify a student cannot read or delete another student's records.
- Verify only authority users can access all feedback and delete records.
- Keep service-role keys only in Supabase Edge Function secrets.
- Set `ALLOWED_ORIGIN` to the exact production origin.
- Use an atomic database rate limiter if the app grows; the included cooldown is a basic starter guard.

## Backups and restore
- Configure provider-managed backups or scheduled exports based on the chosen Supabase plan.
- Store backups in restricted storage, separate from the live database.
- Document retention and access controls.
- Test a restore to a separate environment before relying on backups.

## Analytics and error tracking
- Add PostHog or another privacy-conscious analytics provider only after configuring the required consent/privacy disclosure.
- Add Sentry or another error tracker; scrub emails, comments, tokens, and other personal data from events.
- Do not send raw feedback comments to general analytics.

## UX
- Test phone widths from 320 px upward.
- Test keyboard focus, accessible labels, reduced-motion preferences, loading states, empty states, and error states.
- Keep the student form to four ratings plus an optional short comment.
- Confirm charts distinguish no data from a rating of zero.
- Test CSV export with commas, quotes, and Unicode comments.

## Legal and operations
- Have the institution review privacy policy and terms.
- Add a real institution contact and complaint escalation path.
- Set a retention schedule.
- Deploy and test account deletion before presenting it as active.
- Use a custom domain before public launch.
