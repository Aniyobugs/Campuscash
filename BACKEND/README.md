# Backend (CampusCash)

This folder contains the Node.js/Express backend for CampusCash.

## Required environment variables
- `mongodb_url` - MongoDB connection string (MongoDB Atlas is recommended)
- `SECRET_KEY` - JWT secret used to sign tokens (set securely in your render dashboard)
- `POINT_VALUE_INR` - conversion INR per point (defaults to 50/150 ≈ 0.3333333)
- `NODE_ENV` - `production` (optional)

## Health endpoint
After deployment, a quick health check is available at `/health`.

## Deploying to Render
1. In Render, create a **New → Web Service**.
2. Set the repo and branch, and in **Root** use your repository root.
3. Use the following commands:
   - Build command: `cd BACKEND && npm install`
   - Start command: `cd BACKEND && npm start`
4. Add required env vars in the Render dashboard (`mongodb_url`, `SECRET_KEY`, optionally `POINT_VALUE_INR`).
5. Enable Auto-Deploy if you want automatic deploys on push.

## Notes
- CORS is currently configured in `app.js` to allow your Vercel frontend origin. Update as needed for production safety.
- Receipt point conversion uses `POINT_VALUE_INR`. To change conversion rate, set that variable in Render's env settings.
