# Analytics and error monitoring

The app includes the interface and configuration placeholders but does not silently send student feedback to an analytics vendor.

## Suggested setup
- Product analytics: PostHog, Plausible, or an institution-approved alternative.
- Error monitoring: Sentry or an institution-approved alternative.
- Keep tracking identifiers and configuration out of the source where possible.
- Do not record raw comments, passwords, auth tokens, or student emails in analytics.
- Update the privacy policy and obtain any consent required by institutional policy or applicable law.
- Set alerting for server errors, rate-limit spikes, auth failures, and Edge Function failures.

## Backup note
Backups are a database-provider operational setting, not a frontend feature. Enable an appropriate plan or scheduled export, restrict access, document retention, and test restoration.
