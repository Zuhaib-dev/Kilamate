# 🌤️ Kilamate - Advanced Weather & Air Quality App

<div align="center">
  <img src="https://www.zuhaibrashid.com/Kilamate.png" alt="Kilamate Banner" style="width:100%; border-radius:10px;">
  
  <p><strong>Advanced Weather & Air Quality Forecasting App built with React, Vite, TypeScript, and Shadcn UI.</strong></p>

  <p>
    <a href="https://kilamate.netlify.app" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-Visit_Now-blue?style=for-the-badge&logo=vercel" alt="Live Demo" />
    </a>
    <a href="https://github.com/Zuhaib-dev/Kilamate">
      <img src="https://img.shields.io/github/stars/Zuhaib-dev/Kilamate?style=for-the-badge" alt="GitHub Stars" />
    </a>
  </p>
</div>

---

## 📌 About

**Kilamate** is a modern, high-performance weather forecasting application developed by **Zuhaib Rashid**. It goes beyond basic temperature readings by providing **Real-time Air Quality Index (AQI)** data, detailed pollutant breakdowns, and specialized **Kashmir agricultural insights** for orchard owners and farmers.

Designed with a focus on user experience, it features a beautiful, responsive interface that works seamlessly across all devices, leveraging the power of **Vite** for lightning-fast performance.

---

## 🚀 Key Features

- 🌍 **Live Weather:** Accurate current weather data for any city worldwide
- 📰 **Live Weather News:** Real-time, location-based weather & climate news feed via GNews API
- 🏆 **Best Day Suggester:** Smart scoring algorithm identifying the optimal day for outdoor activities
- ⏳ **History vs Now:** Deep comparison of current conditions against 5-year historical averages
- 🌫️ **Air Quality Index (AQI):** Real-time US AQI scores with color-coded scale and pollutant breakdown
- 🧭 **Advanced Wind Compass:** Beautifully animated SVG compass rose with Beaufort scale tracking
- ☀️ **Sun & Golden Hour Tracker:** Interactive arc visualization with photography-focused "Golden Hour" indicators
- 🎨 **Dynamic Backgrounds:** Immersive, animated weather environments (Rain, Snow, Stars, Lightning)
- 🍎 **Agriculture Advisor:** Specialized Kashmir Apple phenology tracking and SKUAST-K spray schedules
- 🌡️ **Unit Preferences:** Toggle between Celsius/Fahrenheit and multiple wind speed units
- 🔍 **Smart Search:** Search functionality with history, favorite cities, and shareable weather cards
- 📊 **Interactive Charts:** Temperature, humidity, and precipitation trends using Recharts
- ⚡ **High Performance:** Optimized API caching with TanStack Query and Framer Motion animations
- ✨ **Modern UI:** Clean, glassmorphic design using Shadcn UI + Tailwind CSS

---

## 🧪 Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query + Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** OpenWeather API, GNews API, Open-Meteo Historical API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenWeather API key ([Get one free here](https://openweathermap.org/api))
- GNews API key ([Get one free here](https://gnews.io/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Zuhaib-dev/Kilamate.git
   cd Kilamate
   ```

2. **Fix PowerShell Execution Policy (Windows only)**
   
   If you encounter "running scripts is disabled" error, run PowerShell as Administrator:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeather API key:
   ```
   VITE_OPENWEATHER_API_KEY=your_openweather_key
   VITE_GNEWS_API_KEY=your_gnews_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

---

## 🎨 Features in Detail

### Weather Alerts
Intelligent alerts for:
- High wind conditions
- Extreme temperatures (heat/cold)
- Low visibility (fog/mist)
- High humidity
- Temperature perception differences

### User Preferences
Customize your experience:
- Temperature units (Celsius/Fahrenheit)
- Wind speed units (km/h, mph, m/s)
- Persistent settings across sessions

### Air Quality Monitoring
- Real-time AQI with color-coded severity
- 24-hour forecast trends
- Detailed pollutant breakdown
- Health recommendations

### 🌟 Premium Data Visualizations
- **Best Day This Week:** Analyzes rain chance, temperature, AQI, and sky conditions to score the best day for a picnic or photography.
- **Historical Comparison:** Fetches 5 years of archive data to tell you if today is an anomaly or typical for the season.
- **Dynamic Weather System:** The app background physically rains, snows, or twinkles with stars based on live conditions.
- **Sun & Golden Hour:** Specifically tuned for photographers to track the best lighting windows.

### Kashmir Agricultural Insights
- **SKUAST-K Spray Schedule:** Highly detailed duration-based phenological tracking for apple orchards.
- **Apple Scab Warnings:** Identifies Mills Period conditions from live meteorological data.
- **Fungicide & Fertilizer Dosages:** Live chemical advice based on specific apple growth stages (e.g., *Petal Fall, Fruit Let*).
- **Multi-lingual Native Support:** Translates critical farming terms into Urdu (`ur`) and Hindi (`hi`).

---

## 🛠️ Development

### Project Structure

```
Kilamate/
├── public/              # Static assets
├── src/
│   ├── api/            # API configuration and types
│   ├── components/     # React components
│   │   ├── ui/        # Shadcn UI components
│   │   └── ...        # Feature components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── App.tsx        # Main app component
├── .env.example       # Environment variables template
└── package.json       # Dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues

- PowerShell execution policy may block npm on Windows (see installation steps)
- Zustand dependency needs manual installation after fixing PowerShell policy

---

## 🌐 Live Preview

👉 **[Visit Kilamate](https://kilamate.netlify.app)**

---

## 👨‍💻 Developed By

**Zuhaib Rashid**  
Frontend Web Developer | Class 12 (Medical Stream)  
📍 Srinagar, Jammu and Kashmir, India

---

## 🔗 Connect With Me

- 📧 **Email:** [zuhaibrashid01@gmail.com](mailto:zuhaibrashid01@gmail.com)  
- 💼 **LinkedIn:** [Xuhaib Rashid](https://www.linkedin.com/in/xuhaib-rashid-661345318)  
- 🐙 **GitHub:** [Zuhaib-dev](https://github.com/Zuhaib-dev/)  
- 🐦 **Twitter / X:** [@xuhaib_x9](https://x.com/xuhaib_x9)  
- 🌐 **Portfolio:** [zuhaibrashid.com](https://www.zuhaibrashid.com/)

---

## 🙏 Acknowledgements

**Sheryians Coding School**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🎯 Roadmap

- [ ] PWA support with offline mode
- [ ] Extended 7-14 day forecasts
- [ ] Voice search integration
- [ ] Mobile app (React Native)

--- 

<div align="center">
  Made with ❤️ by Zuhaib Rashid 
</div>  