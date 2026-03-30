# Backend Copilot Prompt

Use this prompt in the backend repository/workspace, not in the Next.js frontend repo.

## Prompt
You are working in the Akhbar Al Youm backend codebase for the legacy IIS / ASP.NET application that serves APIs under `/v1/`.

Your task is to identify and implement the missing backend endpoint that blocks the Next.js frontend migration from reaching full parity.

### Business Context
The frontend migration to Next.js is largely complete.
The main remaining blocker is that legacy CMS static pages from `Read.aspx` cannot yet be loaded through the public API.

The frontend already supports this route:
- `/read/[id]`

But it currently falls back because the backend does not expose a working pages-by-id API.

### What Is Missing
Implement this endpoint:
- `GET /v1/pages/by-id.ashx?id={id}`

This endpoint should return CMS page content from the backend data source that was previously used by legacy `Read.aspx`.

### Expected Response Contract
Successful response shape:

```json
{
  "id": 1,
  "title": "About",
  "slugId": "1",
  "bodyHtml": "<p>...</p>",
  "updatedAt": "2026-03-30T12:00:00Z"
}
```

### Error Behavior
Implement these behaviors:
- `400` for invalid or missing `id`
- `404` when page is not found
- `500` for unexpected server error

### Important Notes
- Preserve existing API conventions and coding style in the backend project.
- Reuse existing data-access patterns already used by other `.ashx` endpoints.
- If there is an existing table/entity/source for CMS pages, use that instead of creating new storage.
- Legacy source behavior indicates `Read.aspx` reads from `TBS_Pages` by id.
- Keep response payload field names exactly as expected by the frontend:
  - `id`
  - `title`
  - `slugId`
  - `bodyHtml`
  - `updatedAt`
- If the backend stores HTML under a different field name, map it to `bodyHtml` in the API response.
- If the backend stores updated timestamp under a different name, map it to `updatedAt`.
- Do not break existing endpoints.

### Existing Frontend Dependency
The Next.js frontend already calls:
- `GET /v1/pages/by-id.ashx?id={id}`

And already maps it into this DTO:

```ts
{
  id: number;
  title: string;
  slugId: string;
  bodyHtml: string;
  updatedAt: string;
}
```

### Backend Investigation Tasks
Before coding, inspect the backend and answer these questions in your work:
1. Where is the existing implementation or data access used by legacy `Read.aspx`?
2. Is there already a reusable repository/service/helper for `TBS_Pages`?
3. What is the correct place under the backend API structure to add `pages/by-id.ashx`?
4. Are there existing endpoint patterns for validation, JSON serialization, and error handling that should be followed?

### Implementation Requirements
1. Find the backend API folder that serves `/v1/*.ashx` endpoints.
2. Find how legacy `Read.aspx` loads page content by `id`.
3. Implement `/v1/pages/by-id.ashx?id={id}` using the same database/business logic layer patterns as the rest of the API.
4. Return JSON with the exact field names required by the frontend.
5. Add any necessary wiring/config/handler registration if required by this backend.
6. If there is already a similar endpoint pattern, follow it exactly.
7. If tests exist in the backend repo, add or update them.
8. If no test framework exists, provide manual verification steps and a sample request/response.

### Acceptance Criteria
The task is only complete when all of the following are true:
1. `GET /v1/pages/by-id.ashx?id=1` returns `200` with valid JSON.
2. Invalid ids return `400`.
3. Missing ids return `404`.
4. The response uses the exact expected field names.
5. The endpoint follows existing backend conventions.
6. No existing API routes are broken.

### Manual Verification Commands
After implementation, verify with examples like:

```powershell
Invoke-WebRequest -Uri "http://localhost:8081/v1/pages/by-id.ashx?id=1" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:8081/v1/pages/by-id.ashx?id=2" -UseBasicParsing
```

### What To Return When Done
When you finish, provide:
1. The exact backend files changed.
2. A short explanation of how the endpoint was implemented.
3. A sample JSON response.
4. Any assumptions made about `TBS_Pages` fields.
5. Any remaining backend risks or follow-up items.

### Optional Secondary Check
There is one related item that is already resolved on the frontend side:
- author archive support via `/v1/news.ashx?author={id|slug}&page={n}&limit={m}`

Do not prioritize that unless you discover it is incomplete in backend code.
The primary objective is the CMS pages endpoint for `Read.aspx` parity.
