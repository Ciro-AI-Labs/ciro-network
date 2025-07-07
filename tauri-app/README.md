# 🖥️ CIRO Worker Desktop Application

**Cross-Platform Desktop App for GPU Owners**

## Overview

The CIRO Worker Desktop Application is a beautiful, cross-platform desktop
application built with Tauri that enables GPU owners to easily join the CIRO
Network. It provides an intuitive interface for managing worker nodes,
monitoring earnings, and participating in the decentralized compute marketplace.

## Features

### 🎨 **Modern UI/UX**

- Clean, responsive design with dark/light themes
- Real-time dashboard with GPU utilization
- Earnings tracking and analytics
- Job history and performance metrics

### 🔧 **Easy Setup**

- One-click worker node installation
- Automatic GPU detection and configuration
- Simple wallet connection (Starknet)
- Guided onboarding process

### 💰 **Earnings Management**

- Real-time earnings display
- Historical earnings charts
- Withdrawal management
- Tax reporting tools

### 🔍 **Monitoring & Analytics**

- Live GPU utilization graphs
- Temperature and power monitoring
- Job completion statistics
- Network connectivity status

### 🔒 **Security & Privacy**

- Local key management
- Secure wallet integration
- Privacy-focused design
- Encrypted local storage

## Architecture

```
tauri-app/
├── src/                           # Frontend React/TypeScript
│   ├── components/               # React components
│   │   ├── Dashboard/           # Main dashboard
│   │   ├── Setup/               # Onboarding flow
│   │   ├── Earnings/            # Earnings management
│   │   ├── Settings/            # Application settings
│   │   └── Monitoring/          # GPU monitoring
│   ├── hooks/                   # React hooks
│   ├── services/                # API services
│   ├── stores/                  # State management
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utility functions
├── src-tauri/                    # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs              # Application entry point
│   │   ├── commands.rs          # Tauri commands
│   │   ├── system/              # System integration
│   │   ├── worker/              # Worker node management
│   │   ├── gpu/                 # GPU monitoring
│   │   └── blockchain/          # Starknet integration
│   ├── capabilities/            # Security capabilities
│   ├── icons/                   # Application icons
│   └── tauri.conf.json          # Tauri configuration
├── public/                       # Static assets
└── dist/                         # Build output
```

## Technology Stack

### Frontend

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Recharts**: Beautiful charts and graphs
- **Framer Motion**: Smooth animations

### Backend (Tauri)

- **Rust**: System-level programming
- **Tauri**: Cross-platform desktop framework
- **serde**: Serialization/deserialization
- **tokio**: Async runtime
- **System integration**: GPU monitoring, Docker management

## Development Setup

### Prerequisites

- **Node.js** 18+ ([Install](https://nodejs.org/))
- **Rust** 1.70+ ([Install](https://rustup.rs/))
- **Tauri CLI**
  ([Install](https://tauri.app/v1/guides/getting-started/prerequisites))

### Getting Started

1. **Install dependencies**

   ```bash
   cd tauri-app
   npm install
   ```

2. **Start development server**

   ```bash
   npm run tauri dev
   ```

3. **Build for production**

   ```bash
   npm run tauri build
   ```

## Platform Support

### ✅ Windows

- **Windows 10** (1903+) and **Windows 11**
- **MSI installer** with auto-update
- **System tray integration**
- **Windows-specific GPU APIs**

### ✅ macOS

- **macOS 10.15+** (Catalina and later)
- **Universal binaries** (Intel + Apple Silicon)
- **App Store distribution** ready
- **macOS-specific integrations**

### ✅ Linux

- **Ubuntu 18.04+**, **Debian 10+**, **Fedora 32+**
- **AppImage** and **deb/rpm** packages
- **GTK integration** for native feel
- **X11 and Wayland** support

## User Experience Flow

### 1. **Onboarding**

```
Welcome Screen → GPU Detection → Wallet Connection →
Worker Setup → Dashboard
```

### 2. **Daily Usage**

```
Dashboard → Monitor Earnings → Check GPU Status →
Manage Settings → View Job History
```

### 3. **Earnings Management**

```
View Balance → Check Rewards → Withdraw Funds →
Export Reports → Tax Documentation
```

## Key Components

### 🏠 **Dashboard**

- Real-time GPU utilization
- Current earnings and pending rewards
- Active job status
- Network connectivity

### ⚙️ **Setup Wizard**

- GPU detection and benchmarking
- Wallet connection (Starknet)
- Worker node configuration
- Security settings

### 💰 **Earnings Panel**

- Live earnings counter
- Historical earnings charts
- Withdrawal interface
- Tax reporting tools

### 🔧 **Settings**

- Worker node configuration
- GPU settings and limits
- Notification preferences
- Advanced options

## Building & Distribution

### Development Build

```bash
npm run tauri dev
```

### Production Build

```bash
# Build for current platform
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### Cross-Platform Building

```bash
# Windows (from Linux/macOS)
npm run tauri build -- --target x86_64-pc-windows-msvc

# macOS (from Linux)
npm run tauri build -- --target x86_64-apple-darwin

# Linux (from Windows/macOS)
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## Security Features

### 🔐 **Local Security**

- Encrypted local storage
- Secure key management
- Sandboxed execution environment
- Network request filtering

### 🛡️ **Platform Security**

- Code signing for all platforms
- Automatic security updates
- Minimal system permissions
- Secure communication protocols

## Performance Optimization

### 📊 **Monitoring**

- Real-time GPU metrics
- System resource usage
- Network performance
- Battery usage optimization

### ⚡ **Efficiency**

- Lazy loading components
- Efficient state management
- Minimal background processing
- Smart update scheduling

## Contributing

1. **UI/UX**: Follow design system guidelines
2. **TypeScript**: Use strict typing
3. **Testing**: Write unit and integration tests
4. **Performance**: Profile and optimize
5. **Accessibility**: Ensure WCAG compliance

## Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Starknet Integration Guide](../docs/starknet-integration/)
