# Editorial QA Checklist

Date: 2026-03-30
Phase: 6

## Objective
Validate editorial and preview workflows end-to-end for draft and public article rendering.

## Preconditions
- AKHBAR_PREVIEW_SHARED_SECRET is configured correctly.
- Preview token endpoint and preview article endpoint respond 200 for valid id/token.

## Preview Flow Tests

### Test 1: Enable preview
Steps:
1. Open /api/preview?id={articleId}&slugId={slug-id}
2. Confirm redirect to /news/{slug-id}
3. Confirm preview cookie is set as HttpOnly.

Expected:
- Response redirects successfully.
- previewToken cookie exists.
- Article renders using preview endpoint when token valid.

### Test 2: Exit preview
Steps:
1. Open /api/preview/exit?redirect=/
2. Confirm redirect to /.
3. Confirm previewToken cookie removed.

Expected:
- Cookie is expired/cleared.
- Public content path is used again.

### Test 3: Invalid preview secret
Steps:
1. Configure incorrect secret locally.
2. Call /api/preview?id={id}.

Expected:
- API returns error payload.
- No preview cookie should be set.

### Test 4: Expired or invalid token
Steps:
1. Force invalid preview token cookie.
2. Open article page.

Expected:
- App falls back to public article endpoint.
- Page still renders if public article exists.

## Editorial Content QA
- Draft title appears correctly in preview mode.
- Body HTML renders with acceptable formatting.
- Media links resolve correctly.
- Section/category labels match expected editorial taxonomy.
- Canonical metadata remains valid in preview context.

## SEO Safety QA in Preview
- Preview-only routes should not be indexed.
- Public canonical should still be deterministic.
- Ensure no accidental indexable preview URL variants.

## Regression Cases
- Preview enabled for one article, then navigate to another id.
- Preview exited, browser refresh still shows public content.
- Missing id query in /api/preview should return 400.

## Sign-off Template
- Tester:
- Environment:
- Secret validated: yes/no
- Preview token minted: yes/no
- Preview article render: yes/no
- Exit preview behavior: pass/fail
- Notes:
