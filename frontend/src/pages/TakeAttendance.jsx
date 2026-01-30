import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui/shared';
import { attendanceService } from '../services/attendance';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, X, CheckCircle, ArrowLeft, RefreshCw, Aperture, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TakeAttendance = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleFile = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selected);
        }
    };

    const startCamera = async () => {
        try {
            setCameraActive(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error(err);
            toast.error("Camera access denied or unavailable");
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/jpeg');
            setPreview(dataUrl);

            // Convert Data URL to File object
            canvas.toBlob((blob) => {
                const capturedFile = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                setFile(capturedFile);
            }, 'image/jpeg');

            stopCamera();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }
        if (!file) {
            toast.error('Please upload an image');
            return;
        }
        if (!user) return;

        setIsProcessing(true);
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('teacher_id', user.id);
        formData.append('image', file);

        try {
            const data = await attendanceService.takeAttendance(formData);
            setResult(data);
            toast.success('Attendance marked successfully!');
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setResult(null);
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="max-w-3xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card className="overflow-visible border-none shadow-xl bg-white/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/50">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Camera className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Take Attendance</CardTitle>
                                <p className="text-gray-500">Snap a photo of the class to mark attendance automatically.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!result ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Input
                                        label="Subject / Class Name"
                                        placeholder="e.g. Computer Science 101"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        className="text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Classroom Photo</label>

                                    {/* Camera UI Overlay */}
                                    <AnimatePresence>
                                        {cameraActive && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4"
                                            >
                                                <div className="relative w-full max-w-4xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl aspect-video">
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />

                                                    {/* Camera Controls */}
                                                    <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center space-x-12 bg-gradient-to-t from-black/80 to-transparent">
                                                        <button
                                                            type="button"
                                                            onClick={stopCamera}
                                                            className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
                                                        >
                                                            <X className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={capturePhoto}
                                                            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform bg-white/20 backdrop-blur-sm"
                                                        >
                                                            <div className="w-16 h-16 bg-white rounded-full"></div>
                                                        </button>
                                                        <div className="w-14"></div> {/* Spacer for symmetry */}
                                                    </div>
                                                </div>
                                                <p className="text-white mt-4 text-sm font-medium">Align the class in the frame and tap capture</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!preview ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Upload Option */}
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group h-64"
                                            >
                                                <div className="p-4 bg-gray-50 rounded-full mb-4 group-hover:bg-indigo-50 transition-colors">
                                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                                <span className="text-lg font-medium text-gray-700">Upload Image</span>
                                                <span className="text-sm text-gray-500 mt-1">From gallery or files</span>
                                            </div>

                                            {/* Camera Option */}
                                            <div
                                                onClick={startCamera}
                                                className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-800 transition-all h-64 text-white relative overflow-hidden group shadow-lg"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="p-4 bg-white/10 rounded-full mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                                    <Aperture className="w-8 h-8 text-indigo-300" />
                                                </div>
                                                <span className="text-lg font-bold">Open Camera</span>
                                                <span className="text-sm text-gray-400 mt-1">Take a new photo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100 group">
                                            <img src={preview} alt="Classroom" className="w-full h-auto" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                                <Button variant="secondary" onClick={() => { setFile(null); setPreview(null); }} className="backdrop-blur-md bg-white/90">
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Retake
                                                </Button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setFile(null); setPreview(null); }}
                                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors md:hidden"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFile}
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-lg h-14 font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                                    disabled={isProcessing}
                                    isLoading={isProcessing}
                                >
                                    {isProcessing ? 'Processing Attendance...' : 'Process Attendance'}
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12 space-y-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    type="spring"
                                    className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
                                >
                                    <CheckCircle className="w-12 h-12 text-green-600" />
                                </motion.div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl font-bold text-gray-900">Attendance Marked!</h3>
                                    <p className="text-gray-500 text-lg">The class image has been processed successfully.</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-8 max-w-sm mx-auto border border-gray-100 shadow-sm">
                                    <div className="grid grid-cols-2 gap-8 text-center">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Subject</p>
                                            <p className="text-xl font-bold text-gray-900 mt-1">{subject}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Present</p>
                                            <p className="text-xl font-bold text-green-600 mt-1">{result.present_count} Students</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                                    <Button variant="outline" onClick={resetForm} className="h-12 px-8">
                                        Take Another
                                    </Button>
                                    <Button onClick={() => navigate(`/history/${result.session_id}`)} className="h-12 px-8">
                                        View Report
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default TakeAttendance;
