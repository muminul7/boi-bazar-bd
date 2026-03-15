# Welcome to your Lovable project
## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


## Environment variables

Use the existing `.env` file in the project root and fill in all credentials before running the app/functions.

The project expects Supabase client keys for frontend and payment/email credentials for Edge Functions (PayStation + Resend).

Set `PAYSTATION_API_BASE_URL` to switch between live and sandbox PayStation endpoints. If omitted, it defaults to the live API at `https://api.paystation.com.bd`.

Edge Functions now use a shared config convention at `supabase/functions/_shared/config.ts` to read and validate environment variables in one place.

The checkout flow also includes a Vercel server-side route at `api/initiate-payment.ts`. That route is intended to cover production if the Supabase `initiate-payment` function is missing or not deployed yet.


## Project organization conventions

See `docs/PROJECT_CONVENTIONS.md` for naming and folder-structure conventions used across the project.

Note: the top-level `supabase/` directory name is part of Supabase CLI conventions and should remain as-is.

## How can I deploy this project?

You can deploy the frontend on Vercel as a Vite SPA.

- The repo includes a `vercel.json` rewrite so client-side routes like `/books/:slug`, `/admin`, and `/payment-success` resolve to `index.html`.
- On Vercel, set the frontend env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`.
- For the server-side `api/initiate-payment` route, also set server-only Vercel env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTATION_MERCHANT_ID`, `PAYSTATION_PASSWORD`, `PAYSTATION_API_BASE_URL`, and `APP_BASE_URL`.
- Do not prefix server-only secrets with `VITE_`. Vite only exposes `VITE_*` vars to the browser, so the non-`VITE_` vars stay server-side in Vercel Functions.
- After you know your Vercel production URL, set `APP_BASE_URL` in both Vercel server env vars and Supabase Edge Function secrets so payment redirects and email/download fallbacks use the correct domain.

Lovable publishing is also supported through [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) via Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
