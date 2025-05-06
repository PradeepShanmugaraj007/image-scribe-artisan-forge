
"""
Posture Monitor Application with Web API Integration

This script extends the PostureMonitorApp to communicate with the API server.
Run this alongside api_server.py to enable web integration.

Requirements:
- tkinter
- cv2 (OpenCV)
- mediapipe
- numpy
- matplotlib
- pygame
- pandas
- requests
"""

import tkinter as tk
from tkinter import ttk
import cv2
import threading
import mediapipe as mp
import numpy as np
import matplotlib.pyplot as plt
import pygame
import pandas as pd
import time
import requests
import json
from collections import deque

# API endpoint - make sure api_server.py is running
API_URL = "http://localhost:8000"

# Initialize pygame mixer
try:
    pygame.mixer.init()
    alert_sound = pygame.mixer.Sound("alert.mp3")
except:
    print("Warning: Could not load alert sound. Make sure alert.mp3 exists.")
    alert_sound = None

# Initialize MediaPipe
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
mp_drawing = mp.solutions.drawing_utils

class PostureMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Posture Monitor - Dark Mode - Web Connected")
        self.root.configure(bg="#121212")
        
        # Add API connection status indicator
        self.api_status = tk.Label(
            self.root, 
            text="API: Connecting...", 
            font=("Arial", 12), 
            fg="#FFA500", 
            bg="#121212"
        )
        self.api_status.grid(row=0, column=1, sticky="e", padx=10, pady=5)
        
        # Check API connection
        threading.Thread(target=self.check_api_connection).start()

        # Video feed
        self.video_label = tk.Label(self.root, bg="#121212")
        self.video_label.grid(row=0, column=0, rowspan=6, padx=10, pady=10)

        # Status
        self.status_label = tk.Label(self.root, text="Status: Not Started", font=("Arial", 16), fg="#00FF00", bg="#121212")
        self.status_label.grid(row=1, column=1, sticky="w", padx=10, pady=5)

        # Buttons
        self.start_button = tk.Button(self.root, text="START", font=("Arial", 14), command=self.start_monitoring, bg="#1F1F1F", fg="white")
        self.start_button.grid(row=2, column=1, sticky="ew", padx=10, pady=5)

        self.stop_button = tk.Button(self.root, text="STOP", font=("Arial", 14), command=self.stop_monitoring, bg="#FF3333", fg="white")
        self.stop_button.grid(row=3, column=1, sticky="ew", padx=10, pady=5)

        # Pie chart and line chart setup
        self.figure, (self.ax1, self.ax2) = plt.subplots(2, 1, figsize=(4, 6))
        self.figure.patch.set_facecolor('#121212')
        self.ax1.set_facecolor('#121212')
        self.ax2.set_facecolor('#121212')
        self.canvas = FigureCanvasTkAgg(self.figure, master=self.root)
        self.canvas.get_tk_widget().grid(row=4, column=1, rowspan=2, padx=10, pady=10)

        self.running = False
        self.cap = None
        self.data_log = []
        self.good_count = 0
        self.bad_count = 0
        self.posture_history = []

    def check_api_connection(self):
        """Check if API server is running"""
        try:
            response = requests.get(f"{API_URL}/health")
            if response.status_code == 200:
                self.api_status.config(text="API: Connected", fg="#00FF00")
            else:
                self.api_status.config(text="API: Error", fg="#FF3333")
        except:
            self.api_status.config(text="API: Not Connected", fg="#FF3333")
        
        # Check again every 10 seconds
        self.root.after(10000, self.check_api_connection)

    def update_api(self, posture):
        """Send data updates to API"""
        try:
            data = {
                'good_count': self.good_count,
                'bad_count': self.bad_count,
                'posture_history': self.posture_history[-100:] if len(self.posture_history) > 100 else self.posture_history,
                'posture': posture
            }
            requests.post(f"{API_URL}/update", json=data)
        except Exception as e:
            print(f"Error updating API: {e}")

    def start_monitoring(self):
        if not self.running:
            # Notify API that we're starting
            try:
                requests.post(f"{API_URL}/start")
            except Exception as e:
                print(f"Error notifying API of start: {e}")
                
            self.running = True
            self.cap = cv2.VideoCapture(0)
            threading.Thread(target=self.process_video).start()

    def stop_monitoring(self):
        if self.running:
            self.running = False
            if self.cap:
                self.cap.release()
            self.save_session()
            
            # Notify API that we're stopping
            try:
                requests.post(f"{API_URL}/stop")
            except Exception as e:
                print(f"Error notifying API of stop: {e}")

    def save_session(self):
        df = pd.DataFrame(self.data_log, columns=["Timestamp", "Posture"])
        df.to_csv("posture_session.csv", index=False)

    def process_video(self):
        bad_posture_start_time = None
        last_alert_time = 0
        alert_interval = 10
        nose_x_buffer = deque(maxlen=5)
        left_shoulder_x_buffer = deque(maxlen=5)
        right_shoulder_x_buffer = deque(maxlen=5)
        calibrated = False
        calibration_frames = 50
        z_baseline_values = []

        while self.running and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            frame = cv2.resize(frame, (640, 480))
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)

            posture = "Good Posture"
            color = (0, 255, 0)

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
                landmarks = results.pose_landmarks.landmark

                left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
                right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
                nose = landmarks[mp_pose.PoseLandmark.NOSE]

                nose_x_buffer.append(nose.x)
                left_shoulder_x_buffer.append(left_shoulder.x)
                right_shoulder_x_buffer.append(right_shoulder.x)

                if not calibrated:
                    z_baseline_values.append(nose.z)
                    if len(z_baseline_values) >= calibration_frames:
                        z_baseline = sum(z_baseline_values) / len(z_baseline_values)
                        calibrated = True
                    continue

                smoothed_nose_x = sum(nose_x_buffer) / len(nose_x_buffer)
                smoothed_left_x = sum(left_shoulder_x_buffer) / len(left_shoulder_x_buffer)
                smoothed_right_x = sum(right_shoulder_x_buffer) / len(right_shoulder_x_buffer)

                shoulder_diff = abs(left_shoulder.y - right_shoulder.y)
                z_diff = nose.z - z_baseline

                left_dx = abs(smoothed_nose_x - smoothed_left_x)
                right_dx = abs(smoothed_nose_x - smoothed_right_x)
                x_diff = abs(left_dx - right_dx)

                slouch_thresh = 0.05
                lean_thresh = -0.10
                neck_tilt_threshold = 0.12

                if shoulder_diff > slouch_thresh:
                    posture = "Slouching"
                    color = (255, 0, 0)
                elif z_diff < lean_thresh:
                    posture = "Leaning Forward"
                    color = (255, 0, 0)
                elif x_diff > neck_tilt_threshold:
                    posture = "Neck Tilt"
                    color = (255, 0, 0)

            if posture != "Good Posture":
                if bad_posture_start_time is None:
                    bad_posture_start_time = time.time()
                elif time.time() - bad_posture_start_time >= 20:
                    current_time = time.time()
                    if current_time - last_alert_time > alert_interval:
                        if alert_sound:
                            alert_sound.play()
                        last_alert_time = current_time
            else:
                bad_posture_start_time = None

            timestamp = time.strftime('%H:%M:%S')
            self.data_log.append([timestamp, posture])

            if posture == "Good Posture":
                self.good_count += 1
            else:
                self.bad_count += 1

            self.posture_history.append(1 if posture == "Good Posture" else 0)
            
            # Update API with current posture status
            self.update_api(posture)

            self.update_gui(frame, posture, color)

        self.cap.release()

    def update_gui(self, frame, posture, color):
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (480, 360))
        
        # Convert to PhotoImage
        try:
            from PIL import Image, ImageTk
            img = Image.fromarray(img)
            photo = ImageTk.PhotoImage(image=img)
        except ImportError:
            # Fallback if PIL is not available
            img = np.clip(img, 0, 255).astype(np.uint8)
            photo = tk.PhotoImage(master=self.video_label, data=cv2.imencode('.ppm', img)[1].tobytes())

        self.video_label.configure(image=photo)
        self.video_label.image = photo

        self.status_label.configure(text=f"Status: {posture}", fg=f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}")

        self.ax1.clear()
        self.ax2.clear()

        labels = ['Good', 'Bad']
        sizes = [self.good_count, self.bad_count]
        colors = ['#00FF00', '#FF3333']
        self.ax1.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
        self.ax1.set_title('Posture Pie Chart', color='white')

        self.ax2.plot(self.posture_history[-100:] if len(self.posture_history) > 100 else self.posture_history, color="#00FF00")
        self.ax2.set_ylim(-0.5, 1.5)
        self.ax2.set_yticks([0, 1])
        self.ax2.set_yticklabels(['Bad', 'Good'], color='white')
        self.ax2.set_title('Posture Over Time', color='white')

        try:
            self.canvas.draw()
        except Exception as e:
            print(f"Error drawing canvas: {e}")

if __name__ == "__main__":
    try:
        # Import matplotlib canvas
        from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
        
        # Create tkinter app
        root = tk.Tk()
        app = PostureMonitorApp(root)
        
        print("Posture Monitor started. Press Ctrl+C to exit.")
        print("Make sure the API server is running at", API_URL)
        
        root.mainloop()
    except ImportError as e:
        print(f"Import Error: {e}")
        print("Please make sure all required packages are installed:")
        print("pip install opencv-python mediapipe numpy matplotlib pygame pandas requests pillow")
    except Exception as e:
        print(f"Error: {e}")
