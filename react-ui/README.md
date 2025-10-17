# 🚗 Uber Clone - React UI

Modern React frontend for the Uber Clone application with container management.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📱 Features

- **🎨 Modern UI** - Clean, responsive design with Uber's black/white theme
- **⚡ Real-time Updates** - Live driver tracking and ride status
- **🐳 Container Management** - Admin panel for Docker containers
- **📱 Mobile Responsive** - Works on all devices
- **🔄 Auto-refresh** - Automatic data updates

## 🏗️ Architecture

```
react-ui/
├── src/
│   ├── components/common/    # Reusable components
│   ├── pages/               # Main page components
│   ├── services/            # API integration
│   └── App.js              # Main app with routing
├── public/
└── package.json
```

## 🌐 Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Role selection landing |
| `/rider` | RiderPage | Passenger interface |
| `/driver` | DriverPage | Driver dashboard |
| `/admin` | AdminPage | Container management |

## 🔧 API Integration

All backend communication handled through `services/api.js`:

```javascript
import { rideAPI } from './services/api';

// Request a ride
const response = await rideAPI.requestRide(rideData);

// Get available drivers
const drivers = await rideAPI.getAvailableDrivers();
```

## 🎨 Design System

- **Colors:** Uber black (#000000) and white (#ffffff)
- **Typography:** System fonts (-apple-system, Segoe UI)
- **Components:** Reusable buttons, cards, inputs
- **Icons:** Lucide React icons

## 📦 Dependencies

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Modern icons

## 🚀 Development

```bash
# Start with backend
cd ../server && uvicorn app.main:app --reload

# Start React (new terminal)
cd react-ui && npm start
```

Access at: http://localhost:3000

## 🔄 Auto-refresh Features

- **Drivers list** refreshes every 30 seconds
- **Queue status** updates every 15 seconds  
- **Container status** updates every 5 seconds

## 📱 Mobile Support

Fully responsive design with:
- Touch-friendly buttons
- Mobile navigation
- Optimized layouts
- Fast loading

---

**Built with ❤️ using React and modern web standards**