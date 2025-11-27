# Deployment Guide for Bus Tracker Pro

This guide will help you deploy your "Bus Tracker Pro" application to the web. We recommend using **Netlify** or **Vercel** as they are free, easy to use, and excellent for React applications.

## Prerequisites

- A GitHub account (recommended) or a verified email address.
- The project code on your local machine.
- Your `GEMINI_API_KEY` (from your `.env` file).

---

## Option 1: Deploy to Netlify (Easiest for Manual Upload)

1.  **Build the Project Locally**
    - Open your terminal in the project folder.
    - Run the command:
      ```bash
      npm run build
      ```
    - This creates a `dist` folder in your project directory. This folder contains your production-ready app.

2.  **Upload to Netlify**
    - Go to [app.netlify.com](https://app.netlify.com/drop).
    - Drag and drop the `dist` folder onto the page.
    - Your site will be live instantly!

3.  **Configure Environment Variables**
    - Once deployed, go to **Site settings** > **Configuration** > **Environment variables**.
    - Click **Add a variable**.
    - Key: `VITE_GOOGLE_MAPS_API_KEY`
    - Value: *[Paste your AIzaSy... key]*
    - Click **Create variable**.
    - **Repeat for Supabase**:
        - Key: `VITE_SUPABASE_URL` -> Value: *[Paste your https://...supabase.co url]*
        - Key: `VITE_SUPABASE_ANON_KEY` -> Value: *[Paste your eyJ... key]*
    - **Important**: You may need to redeploy (trigger a new build or just re-upload) for the changes to take effect if you were using a build command on Netlify, but for drag-and-drop, it usually works for runtime calls. However, since Vite bundles env vars at build time, **for drag-and-drop, you must ensure your local build had the env vars set correctly or use the "Import from Git" method below for better management.**

    > **Better Approach for Netlify (Git)**:
    > 1. Push your code to GitHub.
    > 2. Log in to Netlify and click "Add new site" > "Import an existing project".
    > 3. Connect to GitHub and select your repository.
    > 4. In "Build settings", set the build command to `npm run build` and publish directory to `dist`.
    > 5. Under "Environment variables", add `GEMINI_API_KEY` and your key.
    > 6. Click "Deploy". This ensures your API key is correctly bundled during the build on Netlify's servers.

---

## Option 2: Deploy to Vercel (Recommended)

1.  **Push to GitHub**
    - Ensure your project is pushed to a GitHub repository.

2.  **Import to Vercel**
    - Go to [vercel.com](https://vercel.com) and sign up/login.
    - Click **"Add New..."** > **"Project"**.
    - Import your `bustracker-pro` repository.

3.  **Configure Project**
    - Vercel will automatically detect Vite and React.
    - **Environment Variables**: Expand the "Environment Variables" section.
    - Add:
        - Name: `GEMINI_API_KEY`
        - Value: *[Paste your actual API key here]*
    - Click **"Add"**.

4.  **Deploy**
    - Click **"Deploy"**.
    - Vercel will build your project and give you a live URL in about a minute.

---

## Troubleshooting

If you encounter issues after deploying, check these common fixes:

### 1. "Page Not Found" or 404 on Refresh
**Issue**: You navigate to a page (e.g., `/driver-login`) and refresh, but get a 404 error.
**Fix**: Single Page Apps (SPAs) need all requests to be redirected to `index.html`.
*   **Netlify**: Create a file named `_redirects` in your `public` folder with this content:
    ```
    /*  /index.html  200
    ```
    Then rebuild and deploy.
*   **Vercel**: Usually handles this automatically, but if not, create a `vercel.json` in the root:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/" }]
    }
    ```

### 2. Google Maps Not Loading
**Issue**: The map shows an error or doesn't load.
**Fix**:
*   Check your browser console (F12 > Console).
*   Ensure `GEMINI_API_KEY` is set in your hosting provider's environment variables.
*   **Important**: If you used "Drag and Drop", the API key from your local `.env` might not be included if it wasn't set during the local build. **We strongly recommend using the Git deployment method (Option 2 or Netlify Git) so the server builds it with the secret key.**
*   Verify your Google Maps API key has restrictions that allow your new domain (e.g., `your-app.netlify.app`). Go to Google Cloud Console > Credentials and update the "Website restrictions".

### 3. App Crashes or Blank Screen
**Issue**: You see a white screen.
**Fix**:
*   Open Developer Tools (F12) and check the **Console** tab.
*   Look for red errors.
*   Common cause: Code that works locally but fails in production (e.g., accessing `window` too early, or strict CORS policies on an API you are calling).

### 4. Updates Not Showing
**Issue**: You deployed a new version but don't see changes.
**Fix**:
*   Clear your browser cache or try an Incognito/Private window.
*   Verify the build finished successfully on your dashboard (Netlify/Vercel).
