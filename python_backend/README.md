
# Python Backend for Posture Monitor Web App

This folder contains the Python backend components that connect your existing Posture Monitor Python application to the web application.

## Requirements

Make sure you have the following Python packages installed:

```
pip install flask flask-cors opencv-python mediapipe numpy matplotlib pygame pandas requests pillow
```

## Files

- `api_server.py` - API server that acts as a bridge between the web app and the Python posture detection application
- `posture_monitor_web.py` - Modified version of your posture monitor application that communicates with the API server
- `alert.mp3` - Sound file used for alerts (you need to provide this)

## How to Run

1. **Start the API Server**:
   ```
   python api_server.py
   ```
   This will start a Flask server on port 8000.

2. **Start the Posture Monitor Application**:
   ```
   python posture_monitor_web.py
   ```
   This will start the GUI application that performs posture detection.

3. **Connect from Web Application**:
   Make sure your web application is configured to connect to `http://localhost:8000` for the Python backend.

## API Endpoints

- `GET /data` - Get current posture data
- `POST /start` - Start monitoring
- `POST /stop` - Stop monitoring
- `POST /update` - Update posture data (called by the Python application)
- `GET /health` - Health check endpoint

## Troubleshooting

- If you see "API: Not Connected" in the Python application, make sure `api_server.py` is running.
- If the web application cannot connect to the Python backend, check that the URL in `.env` file is set correctly.
- Make sure all ports are available (5000 for Node.js backend, 8000 for Python API).
