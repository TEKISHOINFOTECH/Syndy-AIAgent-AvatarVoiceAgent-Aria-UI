# Aria Avatar UI - Next.js Application

A modern Next.js application for Tekisho AI Assistant featuring real-time video conversations with an AI avatar powered by LiveKit and Tavus.

## 🚀 Features

- **Real-time Video Conversations**: Interactive AI avatar with video and audio streaming
- **LiveKit Integration**: Seamless WebRTC communication
- **Transcript Panel**: Live conversation history with timestamps
- **Responsive Design**: Mobile-friendly interface
- **TypeScript**: Fully typed for better development experience
- **Custom Hooks**: Reusable hooks for LiveKit and transcript management
- **Component-Based Architecture**: Modular and maintainable code structure

## 📁 Project Structure

```
avatar-ui-next/
├── app/
│   ├── components/           # React components
│   │   ├── AvatarComponent.tsx      # Main chat interface
│   │   ├── LiveKitComponent.tsx     # LiveKit integration
│   │   ├── VideoPlayer.tsx          # Video/audio player
│   │   ├── TranscriptPanel.tsx      # Conversation transcript
│   │   └── WelcomeScreen.tsx        # Initial welcome screen
│   ├── hooks/               # Custom React hooks
│   │   ├── useLiveKit.ts    # LiveKit connection management
│   │   └── useTranscript.ts # Transcript state management
│   ├── api/                 # API routes
│   │   └── get-token/       # Token generation endpoint
│   │       └── route.ts
│   └── globals.css          # Global styles
├── pages/
│   ├── _app.js              # App wrapper
│   └── index.js             # Home page
├── public/                  # Static assets
│   ├── livekit-client.umd.js
│   └── livekit-loader.js
├── styles/
│   └── globals.css          # Global styles
├── types/
│   └── index.ts             # TypeScript type definitions
├── package.json
├── next.config.ts
└── tsconfig.json
```

## 🛠️ Prerequisites

- Node.js 18+ and npm
- Python 3.12+ (for backend)
- LiveKit Cloud account
- Tavus API access

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Aria_Avatar_with_UI/avatar-ui-next
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# Backend URL
BACKEND_URL=http://localhost:5001
```

### 4. Set Up Backend

Navigate to the backend directory and set up the Python environment:

```bash
cd ../backend
python3 -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```env
# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

# Tavus Configuration
TAVUS_API_KEY=your_tavus_api_key
REPLICA_ID=your_replica_id
PERSONA_ID=your_persona_id

# MongoDB Configuration
MONGO_URI=your_mongodb_uri
MONGO_DB_NAME=tekisho_db
MONGO_COLLECTION=clients
```

## 🚀 Running the Application

### Step 1: Start the LiveKit Agent

```bash
cd backend
source env/bin/activate  # On Windows: env\Scripts\activate
python3 agent.py dev
```

Wait until you see:
```
INFO:livekit.agents:registered worker
```

### Step 2: Start the Flask Server

In a new terminal:

```bash
cd backend
source env/bin/activate
python3 server.py
```

The server will start on `http://localhost:5001`

### Step 3: Start the Next.js Development Server

In a new terminal:

```bash
cd avatar-ui-next
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000 (or 3001 if 3000 is in use)
- **Network**: http://<your-ip>:3000

## 🎯 Usage

1. Open the application in your browser
2. Click the **"Chat with AI Assistant"** button on the welcome screen
3. Allow microphone permissions when prompted
4. Wait for Aria (the AI avatar) to connect
5. Start your conversation!

### Controls

- **🎤 Microphone Button**: Toggle your microphone on/off
- **📝 Transcript Button**: Show/hide the conversation transcript
- **End Chat**: Disconnect from the current session

## 🏗️ Architecture

### Frontend Components

- **AvatarComponent**: Main orchestrator managing chat state
- **LiveKitComponent**: Handles LiveKit room connection and events
- **VideoPlayer**: Displays remote video/audio streams
- **TranscriptPanel**: Shows conversation history
- **WelcomeScreen**: Initial landing interface

### Custom Hooks

- **useLiveKit**: Manages LiveKit connection, tracks, and events
- **useTranscript**: Handles transcript state and operations

### API Routes

- **GET /api/get-token**: Generates LiveKit access tokens

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Adding New Components

1. Create component in `app/components/`
2. Use TypeScript for type safety
3. Import and use in parent components
4. Update styles in `styles/globals.css`

## 🐛 Troubleshooting

### Port 3000 Already in Use

If port 3000 is occupied, Next.js will automatically use port 3001. Update your browser URL accordingly.

### DNS Resolution Error

If you see `socket.gaierror: [Errno -2] Name or service not known`, this is a temporary network issue. The agent will automatically retry and connect successfully.

### Connection Fails

1. Verify all three services are running:
   - LiveKit Agent (agent.py)
   - Flask Server (server.py)
   - Next.js Dev Server
2. Check environment variables are correctly configured
3. Ensure LiveKit URL is accessible
4. Verify API keys are valid

### No Video/Audio

1. Check browser permissions for camera/microphone
2. Verify LiveKit tracks are being published
3. Check browser console for errors

## 📚 Technologies Used

- **Next.js 16**: React framework with TypeScript
- **LiveKit Client SDK**: WebRTC communication
- **LiveKit Server SDK**: Token generation
- **React 19**: UI components
- **TypeScript**: Type safety
- **Flask**: Backend API server
- **Python**: Agent logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software developed for Tekisho Infotech.

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Documentation](https://docs.livekit.io)
- [Tavus Documentation](https://docs.tavus.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 💬 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ by Tekisho Infotech**
