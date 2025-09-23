Local Vercel link (optional)

- Do not commit `.vercel/project.json` (it's gitignored here).
- If you want to bind this local folder to an existing project, run:

  vercel link

- After linking, set env vars via CLI:

  vercel env add VITE_SUPABASE_URL
  vercel env add VITE_SUPABASE_ANON_KEY

- For production deploy:

  vercel --prod
