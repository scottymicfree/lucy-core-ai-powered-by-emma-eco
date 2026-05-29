import cv2
import numpy as np
try:
    import mediapipe as mp

    # Initialize MediaPipe FaceMesh with Iris refinement
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True, # Mandatory for extracting iris coordinates
        min_detection_confidence=0.75,
        min_tracking_confidence=0.75
    )
except ImportError:
    face_mesh = None

def extract_viewport_gaze(video_frame, viewport_width, viewport_height):
    """
    Extracts iris XYZ coordinates and maps them to absolute screen space.
    """
    if face_mesh is None:
        return None, None
        
    image_rgb = cv2.cvtColor(video_frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(image_rgb)
    
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            # MediaPipe refined iris landmarks (indices 468 and 473 are the pupil centers)
            left_pupil = face_landmarks.landmark[468]
            right_pupil = face_landmarks.landmark[473]
            
            # Calculate the binocular convergence point
            avg_x = (left_pupil.x + right_pupil.x) / 2.0
            avg_y = (left_pupil.y + right_pupil.y) / 2.0
            
            # Map normalized coordinates [0.0, 1.0] to absolute viewport pixels
            screen_x = int(avg_x * viewport_width)
            screen_y = int(avg_y * viewport_height)
            
            return screen_x, screen_y
            
    return None, None
