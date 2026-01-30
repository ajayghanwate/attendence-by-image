import os
import cv2
import numpy as np
from deepface import DeepFace
import base64

class FaceService:
    def __init__(self, model_name="Facenet"):
        self.model_name = model_name

    def get_embedding(self, image_bytes):
        """
        Extracts a single face embedding from an image.
        Used for student registration.
        """
        # Convert bytes to opencv image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        try:
            # DeepFace represent extracts embeddings
            # Setting enforce_detection=False prevents crashing if no face is found
            # retinaface is more robust but may be slower. stick to opencv for now but disable enforcement.
            results = DeepFace.represent(
                img_path=img, 
                model_name=self.model_name, 
                enforce_detection=False,
                detector_backend="opencv"
            )
            
            if not results or len(results) == 0:
                print("No face detected in registration image.")
                return None
                
            # Return the first face's embedding
            return results[0]["embedding"]
        except Exception as e:
            print(f"Error extracting embedding: {e}")
            return None

    def process_attendance_image(self, image_bytes):
        """
        Detects multiple faces and extracts embeddings for all detected faces.
        Used for marking attendance from a single classroom photo.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Detect multiple faces
        results = DeepFace.represent(
            img_path=img, 
            model_name=self.model_name, 
            enforce_detection=False, # Don't crash if no faces
            detector_backend="opencv" # Faster local detector
        )
        
        return results # List of dicts with 'embedding' and 'facial_area'

face_service = FaceService()
