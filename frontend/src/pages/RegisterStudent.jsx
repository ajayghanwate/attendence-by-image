import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui/shared';
import { attendanceService } from '../services/attendance';
import { Upload, X, User, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RegisterStudent = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Image size should be less than 5MB");
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        if (!selectedFile) {
            toast.error("Please upload a student photo");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('roll_number', data.rollNumber);
        formData.append('image', selectedFile);

        try {
            await attendanceService.registerStudent(formData);
            toast.success("Student registered successfully!");
            navigate('/students'); // Or back to dashboard
        } catch (error) {
            console.error(error);
            // Toast handled by API interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-gray-100">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <CardTitle className="text-2xl">Register New Student</CardTitle>
                                <p className="text-gray-500">Add a student to the database with their face data.</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                            <div className="space-y-2">
                                <Input
                                    label="Full Name"
                                    placeholder="e.g. John Doe"
                                    {...register('name', { required: "Name is required" })}
                                    error={errors.name?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <Input
                                    label="Roll Number"
                                    placeholder="e.g. CSE-2023-001"
                                    {...register('rollNumber', { required: "Roll Number is required" })}
                                    error={errors.rollNumber?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Student Photo</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                                >
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                    className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <User className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 justify-center">
                                                    <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                        Upload a file
                                                    </span>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                            </>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="mr-3"
                                    onClick={() => navigate('/')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    isLoading={isSubmitting}
                                >
                                    Register Student
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default RegisterStudent;
