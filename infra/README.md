# Infrastructure (AWS)

`setup.sh` runs in AWS CloudShell (us-east-1): `bash setup.sh ACCOUNT_ID REPO_OWNER_ID REPO_ID`. State lives in `~/bulmeong-state.env` there.
The deploy runs `node scripts/i18n-pages.mjs` first (language folders are build output, not in git). Pushes to `master` deploy through `.github/workflows/deploy.yml` (OIDC role, S3 sync, CloudFront invalidation).

| Piece | Value (2026-10-31) |
|---|---|
| Bucket | `bulmeong-site` (private, OAC `E3UHVW8Z25AGA0`) |
| Distribution | `EW8YNP0TCB2HI`, https://d3ouqxquns99r3.cloudfront.net (default certificate, no custom domain yet) |
| Headers policy | `bulmeong-site-headers` (`7c8a4327-e69d-4239-89be-15ffc7a9344b`) |
| Deploy role | `arn:aws:iam::236353235575:role/bulmeong-deploy`, trusted for `repo:webinstudio-plugins@339512356/bulmeong@1440085309:ref:refs/heads/master` |
| Actions variables | `BUCKET`, `DIST_ID`, `ROLE_ARN` |
| Router | CloudFront Function `bulmeong-router` (`router.js`, installed by `setup-router.sh`): `/ja/` → `/ja/index.html`, `/ja` → 301 `/ja/` |

bulmeong.netlify.app only redirects to the CloudFront address (Netlify Free credit plan: 300 credits a month, 15 per deploy).
