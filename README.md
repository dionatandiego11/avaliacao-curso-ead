<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1z4TF-ClkwKVYW1KW5ZBwFl9BjTJ8M7az

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
# AvaliaEAD

Small app to collect and read university/course evaluations.

## Local setup

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env.local` file in the project root with the following variables (this file is gitignored by default):

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

If you prefer, you can copy the existing `.env.local` already in the repo and replace placeholder values.

3. Run the dev server:

```powershell
npm run dev
```

4. Build for production:

```powershell
npm run build
```

Security note: keep `.env.local` out of version control and restrict your Firestore rules in the Firebase console.
