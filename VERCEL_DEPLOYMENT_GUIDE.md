# How to Deploy Bus Tracker Pro to Vercel

Since you don't have the Vercel CLI installed, the easiest way to deploy is via the Vercel website.

## Prerequisites

Ensure you have your project pushed to a GitHub repository.

## Steps

1.  **Go to Vercel:**
    *   Visit [vercel.com](https://vercel.com) and log in (or sign up).

2.  **Import Project:**
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your GitHub repository for `bustracker-pro`.

3.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect **Vite**. If not, select it.
    *   **Root Directory:** `./` (default)

4.  **Environment Variables (CRITICAL):**
    *   Expand the **"Environment Variables"** section.
    *   You MUST add the following variables for the app to work. Copy these values from your local `.env` or `.env.local` file.

    | Name | Value Source |
    | :--- | :--- |
    | `VITE_SUPABASE_URL` | Your Supabase Project URL |
    | `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon/Public Key |
    | `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API Key |
    | `GEMINI_API_KEY` | Your Gemini API Key (if used) |

5.  **Deploy:**
    *   Click **"Deploy"**.
    *   Wait for the build to complete.

## Post-Deployment Checks

*   **Routing:** I have already added a `vercel.json` file to your project to handle routing (fixing 404 errors on refresh).
*   **Google Maps:** If the map doesn't load, ensure your Google Maps API key has "Website Restrictions" configured in the Google Cloud Console to allow your new Vercel domain (e.g., `https://your-app.vercel.app`).
