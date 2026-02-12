# Deployment Guide for DesignInk Roster

This guide explains how to deploy your roster tool to the web using free hosting services (Netlify or Vercel) and connect your `designink.ink` domain.

## Option 1: Netlify (Recommended)

1.  **Create a Netlify Account**: Go to [netlify.com](https://www.netlify.com/) and sign up.
2.  **Deploy**:
    -   Log in to Netlify.
    -   Click **"Add new site"** -> **"Deploy manually"**.
    -   Run `npm run build` in your project folder locally. This creates a `dist` folder.
    -   Drag and drop the `dist` folder onto the Netlify drop zone.
3.  **Connect Domain**:
    -   Go to **"Domain settings"** for your new site.
    -   Click **"Add custom domain"**.
    -   Enter `designink.ink`.
    -   Follow the instructions to add the DNS records (usually an A record or CNAME) to your domain registrar (where you bought `designink.ink`).

## Option 2: Vercel

1.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com/) and sign up.
2.  **Deploy**:
    -   Install Vercel CLI: `npm i -g vercel` (or just drag and drop on dashboard if linked to Git).
    -   Run `vercel` in your project terminal and follow the prompts.
    -   Set `dist` as the output directory if asked.
3.  **Connect Domain**:
    -   Go to your project dashboard -> **Settings** -> **Domains**.
    -   Enter `designink.ink`.
    -   Vercel will show you the exact DNS records to add to your domain registrar.

## Prerequisites

Before deploying, ensure you have a production build:

```bash
npm run build
```

This will create a `dist` folder containing your optimized website.
