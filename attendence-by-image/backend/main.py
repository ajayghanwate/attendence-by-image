from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase_client import supabase
from face_service import face_service
import uuid
from typing import List

app = FastAPI(title="AI Attendance System API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/teacher/signup")
async def signup_teacher(email: str = Form(...), password: str = Form(...)):
    if not supabase:
        # Mock Response
        return {
            "message": "Teacher registered successfully (Mock)",
            "user": {"id": "mock-user-id", "email": email}
        }
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed.")
        
        # Also create a record in the public.teachers table
        teacher_data = {
            "id": res.user.id,
            "email": email
        }
        supabase.table("teachers").insert(teacher_data).execute()

        return {"message": "Teacher registered successfully", "user": res.user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/teacher/login")
async def login_teacher(email: str = Form(...), password: str = Form(...)):
    if not supabase:
        # Mock Response
        return {
            "message": "Login successful (Mock)",
            "user": {"id": "mock-user-id", "email": email},
            "session": {"access_token": "mock-token", "refresh_token": "mock-refresh"}
        }
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })
        if not res.user:
            raise HTTPException(status_code=401, detail="Login failed.")
        return {"message": "Login successful", "user": res.user, "session": res.session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/register-student")
async def register_student(
    name: str = Form(...),
    roll_number: str = Form(...),
    image: UploadFile = File(...)
):
    if not supabase:
        return {"message": "Student registered successfully (Mock)", "student_id": str(uuid.uuid4())}

    try:
        # Read image bytes
        image_bytes = await image.read()
        
        # Get embedding
        embedding = face_service.get_embedding(image_bytes)
        
        if not embedding:
            raise HTTPException(status_code=400, detail="No face detected in the image.")

        # 1. Insert student into 'students' table
        student_data = {
            "name": name,
            "roll_number": roll_number
        }
        res = supabase.table("students").insert(student_data).execute()
        
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to register student.")
            
        student_id = res.data[0]["id"]
        
        # 2. Insert embedding into 'student_embeddings' table
        embedding_data = {
            "student_id": student_id,
            "embedding": embedding
        }
        supabase.table("student_embeddings").insert(embedding_data).execute()
        
        return {"message": "Student registered successfully", "student_id": student_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/take-attendance")
async def take_attendance(
    subject: str = Form(...),
    teacher_id: str = Form(...), # Associated with the logged-in teacher
    image: UploadFile = File(...)
):
    if not supabase:
        return {
            "message": "Attendance marked (Mock)",
            "session_id": str(uuid.uuid4()),
            "present_count": 5
        }

    try:
        image_bytes = await image.read()
        
        # 1. Detect all faces and get their embeddings
        detected_faces = face_service.process_attendance_image(image_bytes)
        
        if not detected_faces:
            raise HTTPException(status_code=400, detail="No faces detected in the classroom image.")

        # 2. Create an attendance session associated with the teacher
        session_res = supabase.table("attendance_sessions").insert({
            "subject": subject,
            "teacher_id": teacher_id
        }).execute()
        if not session_res.data:
            raise HTTPException(status_code=500, detail="Failed to create attendance session.")
        
        session_id = session_res.data[0]["id"]
        
        present_student_ids = set()
        
        # 3. Match each detected face against the database
        for face in detected_faces:
            embedding = face["embedding"]
            
            # Call the Supabase RPC function for vector matching
            match_res = supabase.rpc("match_student_embeddings", {
                "query_embedding": embedding,
                "match_threshold": 0.4, # Adjust based on model (Facenet usually > 0.4 similarity)
                "match_count": 1
            }).execute()
            
            if match_res.data:
                student_id = match_res.data[0]["student_id"]
                present_student_ids.add(student_id)
        
        # 4. Mark attendance for identified students
        if present_student_ids:
            records = [{"session_id": session_id, "student_id": sid, "status": "present"} for sid in present_student_ids]
            supabase.table("attendance_records").insert(records).execute()
        
        # 5. (Optional) Identify who is absent
        # For simplicity, we just return the counts for now
        return {
            "message": "Attendance marked",
            "session_id": session_id,
            "present_count": len(present_student_ids)
        }
        
    except Exception as e:
        print(f"Error in take_attendance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
async def get_students():
    if not supabase:
        return [
            {"id": "1", "name": "Alice Smith", "roll_number": "A001"},
            {"id": "2", "name": "Bob Jones", "roll_number": "A002"},
            {"id": "3", "name": "Charlie Brown", "roll_number": "A003"},
        ]
    res = supabase.table("students").select("*").execute()
    return res.data

@app.get("/attendance-history")
async def get_history(teacher_id: str):
    if not supabase:
        from datetime import datetime
        return [
            {
                "id": "session-1",
                "subject": "Mathematics",
                "created_at": datetime.now().isoformat(),
                "attendance_records": [{"count": 25}]
            },
            {
                "id": "session-2",
                "subject": "Physics",
                "created_at": datetime.now().isoformat(),
                "attendance_records": [{"count": 18}]
            }
        ]
    # Only show history for the specific teacher
    res = supabase.table("attendance_sessions")\
        .select("*, attendance_records(count)")\
        .eq("teacher_id", teacher_id)\
        .order("created_at", desc=True)\
        .execute()
    return res.data

@app.get("/attendance-history/{session_id}")
async def get_session_details(session_id: str):
    if not supabase:
        return [
            {"student_id": "1", "status": "present", "created_at": "2023-10-27T10:00:00Z", "students": {"name": "Alice Smith", "roll_number": "A001"}},
            {"student_id": "2", "status": "present", "created_at": "2023-10-27T10:05:00Z", "students": {"name": "Bob Jones", "roll_number": "A002"}},
        ]
    res = supabase.table("attendance_records").select("*, students(*), attendance_sessions(subject, created_at)").eq("session_id", session_id).execute()
    return res.data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
