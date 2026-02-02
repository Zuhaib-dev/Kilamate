# 🚀 Kilamate Setup Guide

This guide will help you set up and run Kilamate on your local machine.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** version 18 or higher
- **npm** (comes with Node.js)
- A free **OpenWeather API key**

## Step-by-Step Setup

### 1. Get Your OpenWeather API Key

1. Visit [OpenWeather API](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. After logging in, go to "API keys" section
4. Copy your API key (it may take a few minutes to activate)

### 2. Clone the Repository

```bash
git clone https://github.com/Zuhaib-dev/Kilamate.git
cd Kilamate
```

### 3. Fix PowerShell Execution Policy (Windows Only)

If you're on Windows and encounter this error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

**Solution:**
1. Open PowerShell as **Administrator**
2. Run this command:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. Type `Y` and press Enter to confirm

### 4. Install Dependencies

```bash
npm install
```

**Note:** If you see warnings about Zustand, run:
```bash
npm install zustand
```

### 5. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   On Windows (if `cp` doesn't work):
   ```powershell
   copy .env.example .env
   ```

2. Open `.env` in your text editor

3. Replace `your_api_key_here` with your actual OpenWeather API key:
   ```
   VITE_OPENWEATHER_API_KEY=abc123your_actual_key_here
   ```

### 6. Start the Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v5.4.10  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.x:5173/
```

### 7. Open in Browser

Navigate to `http://localhost:5173` in your web browser.

---

## 🎉 You're All Set!

The app should now be running. You'll be prompted to allow location access for local weather.

---

## Common Issues & Solutions

### Issue: "Missing VITE_OPENWEATHER_API_KEY environment variable"

**Solution:** Make sure you created the `.env` file and added your API key correctly.

### Issue: API returns 401 Unauthorized

**Solution:** 
- Your API key might not be activated yet (wait 10-15 minutes)
- Check if you copied the key correctly
- Ensure there are no extra spaces in the `.env` file

### Issue: npm commands not working on Windows

**Solution:** See Step 3 above about PowerShell execution policy.

### Issue: Port 5173 is already in use

**Solution:** Either:
- Stop the other process using that port
- Or Vite will automatically use the next available port (5174, 5175, etc.)

---

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` folder.

To preview the production build locally:

```bash
npm run preview
```

---

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code for errors and style issues

---

## Project Structure

```
Kilamate/
├── public/              # Static files (icons, images)
├── src/
│   ├── api/            # API configuration and types
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── App.tsx        # Main app component
├── .env               # Your environment variables (not in git)
├── .env.example       # Template for environment variables
└── package.json       # Project dependencies
```

---

## Next Steps

- Explore the app and try searching for different cities
- Toggle between Celsius and Fahrenheit in the settings menu
- Check out the air quality data and weather alerts
- Star the repo if you find it useful! ⭐

---

## Need Help?

- Check the [main README](README.md) for more information
- Open an issue on [GitHub](https://github.com/Zuhaib-dev/Kilamate/issues)
- Contact: [zuhaibrashid01@gmail.com](mailto:zuhaibrashid01@gmail.com)

---

Happy weather tracking! 🌤️
