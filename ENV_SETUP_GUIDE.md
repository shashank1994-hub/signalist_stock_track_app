# Environment Variables Setup Guide

This document lists all required environment variables for the Signalist Stock Tracking App.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/signalist

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-min-32-characters
BETTER_AUTH_URL=http://localhost:3000

# Gemini AI API Key (for personalized welcome emails)
GEMINI_API_KEY=your-gemini-api-key-here

# Inngest Configuration (optional for local development)
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
```

## How to Get API Keys

### 1. MongoDB URI
- If using local MongoDB: `mongodb://localhost:27017/signalist`
- If using MongoDB Atlas: Get connection string from your Atlas dashboard

### 2. Better Auth Secret
- Generate a random 32+ character string
- You can use: `openssl rand -base64 32` (on Mac/Linux)
- Or use an online generator

### 3. Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use an existing one
4. Copy the key and paste it as `GEMINI_API_KEY`

### 4. Inngest Keys (for production)
1. Sign up at [Inngest.com](https://www.inngest.com/)
2. Create a new app
3. Get your Event Key and Signing Key from the dashboard

## Testing Your Setup

### Test Database Connection
```bash
npm run dev
```
Then visit: http://localhost:3000/api/test-db

### Test Inngest Functions (Local Development)
1. Install Inngest CLI: `npm install -g inngest-cli`
2. Run Inngest Dev Server: `npx inngest-cli@latest dev`
3. Visit: http://localhost:8288

### Test Sign-Up Flow
1. Start your dev server: `npm run dev`
2. Navigate to: http://localhost:3000/sign-up
3. Fill in the form and submit
4. Check Inngest dashboard for the welcome email function run

## Common Issues

### Issue: "GEMINI_API_KEY is undefined"
**Solution:** Make sure you have `GEMINI_API_KEY` (not `GEMINION_API_KEY`) in your `.env` file

### Issue: Inngest shows "Failed" with model not found
**Solution:** The code now uses `gemini-1.5-flash` which is a valid model

### Issue: Sign-up form not submitting
**Solution:** This has been fixed - the form field names now match the type definitions

## Available Gemini Models

Valid model names you can use:
- `gemini-1.5-flash` (recommended - fast and efficient)
- `gemini-1.5-pro` (more capable, slower)
- `gemini-1.0-pro` (older version)

## Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- Restart your dev server after changing environment variables
