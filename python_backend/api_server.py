
"""
API server for Posture Monitor

This script creates a simple REST API server that acts as a bridge between
the web application and the posture detection Python application.

Run this alongside your PostureMonitorApp to enable web integration.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
import time
import json
import os
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Shared state between the API and the posture monitor
class SharedState:
    def __init__(self):
        self.is_monitoring = False
        self.good_count = 0
        self.bad_count = 0
        self.posture_history = []
        self.latest_posture = "Good Posture"
        self.sessions = []

state = SharedState()

# Mock file to store data
DATA_FILE = "posture_data.json"

def load_data():
    """Load posture data from file if exists"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                state.good_count = data.get('good_count', 0)
                state.bad_count = data.get('bad_count', 0)
                state.posture_history = data.get('posture_history', [])
                state.latest_posture = data.get('latest_posture', "Good Posture")
                state.sessions = data.get('sessions', [])
        except Exception as e:
            print(f"Error loading data: {e}")

def save_data():
    """Save posture data to file"""
    try:
        with open(DATA_FILE, 'w') as f:
            data = {
                'good_count': state.good_count,
                'bad_count': state.bad_count,
                'posture_history': state.posture_history,
                'latest_posture': state.latest_posture,
                'sessions': state.sessions
            }
            json.dump(data, f)
    except Exception as e:
        print(f"Error saving data: {e}")

# Routes
@app.route('/start', methods=['POST'])
def start_monitoring():
    """Start posture monitoring"""
    state.is_monitoring = True
    print("Posture monitoring started")
    
    # Create a new session
    from datetime import datetime
    import uuid
    
    session = {
        '_id': str(uuid.uuid4()),
        'startTime': datetime.now().isoformat(),
        'endTime': None,
        'totalAlerts': 0,
        'incorrectPostures': [],
        'postureScore': 100
    }
    state.sessions.append(session)
    save_data()
    
    return jsonify({"status": "success", "message": "Monitoring started"})

@app.route('/stop', methods=['POST'])
def stop_monitoring():
    """Stop posture monitoring"""
    state.is_monitoring = False
    print("Posture monitoring stopped")
    
    # Update the latest session
    if state.sessions:
        from datetime import datetime
        state.sessions[-1]['endTime'] = datetime.now().isoformat()
        
        # Calculate score
        good_ratio = state.good_count / (state.good_count + state.bad_count) if (state.good_count + state.bad_count) > 0 else 1
        state.sessions[-1]['postureScore'] = int(good_ratio * 100)
        
    save_data()
    
    return jsonify({"status": "success", "message": "Monitoring stopped"})

@app.route('/data', methods=['GET'])
def get_data():
    """Get current posture data"""
    load_data()  # Load the latest data from file
    
    return jsonify({
        "goodCount": state.good_count,
        "badCount": state.bad_count,
        "postureHistory": state.posture_history,
        "latestPosture": state.latest_posture,
        "sessions": state.sessions,
        "isMonitoring": state.is_monitoring
    })

@app.route('/update', methods=['POST'])
def update_data():
    """Update posture data (called by the posture monitor application)"""
    data = request.json
    
    if 'good_count' in data:
        state.good_count = data['good_count']
    if 'bad_count' in data:
        state.bad_count = data['bad_count']
    if 'posture_history' in data:
        state.posture_history = data['posture_history']
    if 'posture' in data:
        state.latest_posture = data['posture']
        
        # Update session data if monitoring
        if state.is_monitoring and state.sessions and data['posture'] != 'Good Posture':
            state.sessions[-1]['totalAlerts'] += 1
            if data['posture'] not in state.sessions[-1]['incorrectPostures']:
                state.sessions[-1]['incorrectPostures'].append(data['posture'])
    
    save_data()
    return jsonify({"status": "success"})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return """
    <html>
        <head>
            <title>Posture Monitor API</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
                h1 { color: #2c3e50; }
                .endpoint { background: #f8f9fa; padding: 10px; border-left: 4px solid #3498db; margin-bottom: 20px; }
                code { background: #eee; padding: 2px 4px; }
            </style>
        </head>
        <body>
            <h1>Posture Monitor API</h1>
            <p>This is the API server that connects your Python posture monitoring application to the web interface.</p>
            
            <h2>Available Endpoints:</h2>
            <div class="endpoint">
                <h3>GET /data</h3>
                <p>Retrieve current posture monitoring data</p>
            </div>
            <div class="endpoint">
                <h3>POST /start</h3>
                <p>Start posture monitoring</p>
            </div>
            <div class="endpoint">
                <h3>POST /stop</h3>
                <p>Stop posture monitoring</p>
            </div>
            <div class="endpoint">
                <h3>POST /update</h3>
                <p>Update posture data (called by the Python application)</p>
            </div>
            
            <p>The API server is running correctly!</p>
        </body>
    </html>
    """

def run_server():
    """Run the Flask server"""
    app.run(host='0.0.0.0', port=8000)

# Main script
if __name__ == "__main__":
    # Load any existing data
    load_data()
    
    # Start the server
    print("Starting Posture Monitor API Server on http://localhost:8000")
    run_server()
