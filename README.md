# 🌤️ Kilamate - Advanced Weather & Air Quality App

<div align="center">
  <img src="https://www.zuhaibrashid.com/kilamate.webp" alt="Kilamate Banner" style="width:100%; border-radius:10px;">
  
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

**Kilamate** is a modern, high-performance weather forecasting application developed by **Zuhaib Rashid**. It goes beyond basic temperature readings by providing **Real-time Air Quality Index (AQI)** data, detailed pollutant breakdowns, and interactive trend charts.

Designed with a focus on user experience, it features a beautiful, responsive interface that works seamlessly across all devices, leveraging the power of **Vite** for lightning-fast performance.

---

## 🚀 Key Features

- 🌍 **Live Weather:** Accurate current weather data for any city worldwide
- 🌫️ **Air Quality Index (AQI):** Real-time US AQI scores with color-coded scale
- 📉 **AQI Trends:** Interactive graphs visualizing air quality forecast
- 🧪 **Pollutant Details:** Detailed breakdown of PM2.5, PM10, NO2, and SO2 levels
- ⚠️ **Weather Alerts:** Smart alerts for extreme weather conditions
- 🌡️ **Unit Preferences:** Toggle between Celsius/Fahrenheit and wind speed units
- 🔍 **Smart Search:** Search functionality with history and favorite cities
- 📊 **Interactive Charts:** Temperature, humidity, and wind trends using Recharts
- ⚡ **High Performance:** Optimized API caching with TanStack Query
- ✨ **Modern UI:** Clean, dark-mode-first design using Shadcn UI + Tailwind CSS
- 🛡️ **Error Handling:** Robust error boundaries for stability

---

## 🧪 Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **State Management:** TanStack Query + Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **API:** OpenWeather API

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenWeather API key ([Get one free here](https://openweathermap.org/api))

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
   VITE_OPENWEATHER_API_KEY=your_api_key_here
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
- [ ] Weather comparison between cities
- [ ] Social sharing features
- [ ] Voice search integration
- [ ] Mobile app (React Native)

---

<div align="center">
  Made with ❤️ by Zuhaib Rashid
</div>