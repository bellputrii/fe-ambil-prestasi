"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import { deleteTeacher, updateTeacher } from "@/lib/api/teachers";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/optimized-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Save, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema untuk update teacher
const teacherUpdateSchema = z.object({
    fullName: z.string()
        .min(4, "Nama harus minimal 4 karakter")
        .max(100, "Nama maksimal 100 karakter"),
    username: z.string()
        .min(4, "Username harus minimal 4 karakter")
        .max(50, "Username maksimal 50 karakter"),
    email: z.string().email("Email tidak valid"),
    telp: z.string()
        .min(10, "Nomor telepon harus minimal 10 karakter")
        .max(15, "Nomor telepon maksimal 15 karakter"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    specialization: z.string().max(255, "Keahlian maksimal 255 karakter"),
    bio: z.string().max(1000, "Bio maksimal 1000 karakter"),
});

interface TeacherDetailModalProps {
    teacher: Teacher | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (teacher: Teacher) => void;
    onDelete: (teacherId: string) => void;
}

export function TeacherDetailModal({
    teacher,
    isOpen,
    onClose,
    onUpdate,
    onDelete,
}: TeacherDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Teacher | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [errors, setErrors] = useState<{
        fullName?: string;
        username?: string;
        email?: string;
        telp?: string;
        status?: string;
        specialization?: string;
        bio?: string;
    }>({});

    React.useEffect(() => {
        if (teacher) {
            setCurrentTeacher(teacher);
            setEditForm(teacher);
        }
        setIsEditing(false);
    }, [teacher, isOpen]);

    if (!currentTeacher) return null;

    const handleEdit = () => {
        setIsEditing(true);
        setErrors({}); // Clear errors saat mulai edit
    };

    const handleSave = async () => {
        if (editForm) {
            // Validasi form data
            try {
                teacherUpdateSchema.parse({
                    fullName: editForm.fullName,
                    username: editForm.username,
                    email: editForm.email,
                    telp: editForm.phoneNumber,
                    status: editForm.status,
                    specialization: editForm.specialization,
                    bio: editForm.bio,
                });
                setErrors({}); // Clear errors jika validasi berhasil
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const fieldErrors: {
                        fullName?: string;
                        username?: string;
                        email?: string;
                        telp?: string;
                        status?: string;
                        specialization?: string;
                        bio?: string;
                    } = {};
                    error.issues.forEach((issue) => {
                        if (issue.path[0]) {
                            fieldErrors[issue.path[0] as keyof typeof fieldErrors] = issue.message;
                        }
                    });
                    setErrors(fieldErrors);
                    toast.error("Mohon perbaiki kesalahan pada form");
                    return;
                }
            }

            setIsSaving(true);
            try {
                const updatedTeacher = await updateTeacher(currentTeacher.id, {
                    name: editForm.fullName,
                    username: editForm.username,
                    email: editForm.email,
                    telp: editForm.phoneNumber,
                    status: editForm.status.toUpperCase() as "ACTIVE" | "INACTIVE",
                    specialization: editForm.subjects.join(", "),
                    bio: editForm.bio || "",
                });

                // Call onUpdate first to trigger refetch
                onUpdate(updatedTeacher);

                // Then update local state with new data
                setCurrentTeacher(updatedTeacher);
                setEditForm(updatedTeacher);
                toast.success("Data guru berhasil diperbarui");
                setIsEditing(false);
                setErrors({});
            } catch (error: unknown) {
                console.error("Error updating teacher:", error);

                // Handle backend validation errors
                const err = error as { validationErrors?: Record<string, string[]>; message?: string };
                if (err.validationErrors) {
                    const backendErrors: { fullName?: string; username?: string; email?: string } = {};

                    // Map backend errors to form fields (backend uses different field names)
                    Object.keys(err.validationErrors).forEach((field) => {
                        const errorMessages = err.validationErrors?.[field];
                        if (errorMessages && errorMessages.length > 0) {
                            // Map backend field names to frontend field names
                            const frontendField = field === 'name' ? 'fullName' :
                                field === 'telp' ? 'telp' :
                                    field === 'status' ? 'status' :
                                        field === 'specialization' ? 'specialization' :
                                            field === 'bio' ? 'bio' : field;
                            backendErrors[frontendField as keyof typeof backendErrors] = errorMessages[0];
                        }
                    });

                    setErrors(backendErrors);

                    // Show specific error messages
                    Object.entries(backendErrors).forEach(([field, message]) => {
                        if (message) {
                            toast.error(message);
                        }
                    });
                } else {
                    toast.error(err.message || "Gagal memperbarui data guru. Silakan coba lagi.");
                }
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleCancel = () => {
        setEditForm(currentTeacher);
        setIsEditing(false);
        setErrors({}); // Clear errors saat cancel
    };

    const handleDelete = () => {
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteTeacher(currentTeacher.id);
            onDelete(currentTeacher.id);
            toast.success("Data guru berhasil dihapus");
            setShowDeleteAlert(false);
            onClose();
        } catch (error) {
            console.error("Error deleting teacher:", error);
            toast.error("Gagal menghapus guru. Silakan coba lagi.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleInputChange = (
        field: keyof Teacher,
        value: string | string[]
    ) => {
        if (editForm) {
            setEditForm({
                ...editForm,
                [field]: value,
            });
            // Clear error saat user mulai mengetik
            if (errors[field as keyof typeof errors]) {
                setErrors({ ...errors, [field]: undefined });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            {isEditing ? "Edit Guru" : "Detail Guru"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Profile and Information Layout */}
                        <div className="flex gap-6">
                            {/* Profile Photo - Left Side */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage
                                            src={
                                                isEditing
                                                    ? editForm?.profilePhoto
                                                    : currentTeacher.profilePhoto
                                            }
                                            alt={
                                                isEditing ? editForm?.fullName : currentTeacher.fullName
                                            }
                                        />
                                        <AvatarFallback className="text-lg">
                                            {(isEditing ? editForm?.fullName : currentTeacher.fullName)
                                                ?.split(" ")
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            {/* Personal Information - Right Side */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">
                                            Nama Lengkap{" "}
                                            {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    id="fullName"
                                                    value={editForm?.fullName || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("fullName", e.target.value)
                                                    }
                                                    required
                                                    placeholder="Nama lengkap guru"
                                                    className={errors.fullName ? "border-red-500" : ""}
                                                />
                                                {errors.fullName && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.fullName}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="username">
                                            Username{" "}
                                            {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    id="username"
                                                    value={editForm?.username || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("username", e.target.value)
                                                    }
                                                    required
                                                    placeholder="username"
                                                    className={errors.username ? "border-red-500" : ""}
                                                />
                                                {errors.username && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.username}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.username}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={editForm?.email || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("email", e.target.value)
                                                    }
                                                    required
                                                    placeholder="email@example.com"
                                                    className={errors.email ? "border-red-500" : ""}
                                                />
                                                {errors.email && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.email}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.email}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telp">
                                            Nomor Telepon {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    id="telp"
                                                    value={editForm?.phoneNumber || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("phoneNumber", e.target.value)
                                                    }
                                                    required
                                                    placeholder="+62 812-3456-7890"
                                                    className={errors.telp ? "border-red-500" : ""}
                                                />
                                                {errors.telp && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.telp}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.phoneNumber}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">
                                            Status {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <select
                                                    id="status"
                                                    value={editForm?.status || "ACTIVE"}
                                                    onChange={(e) =>
                                                        handleInputChange("status", e.target.value)
                                                    }
                                                    required
                                                    className={`w-full px-3 py-2 border rounded-md ${errors.status ? "border-red-500" : "border-input"
                                                        }`}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                                {errors.status && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.status}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.status}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="specialization">
                                            Keahlian {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    id="specialization"
                                                    value={editForm?.specialization || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("specialization", e.target.value)
                                                    }
                                                    required
                                                    placeholder="Essay Writing, Academic Writing, Research"
                                                    className={errors.specialization ? "border-red-500" : ""}
                                                />
                                                {errors.specialization && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.specialization}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted">
                                                {currentTeacher.specialization}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">
                                            Bio {isEditing && <span className="text-red-500">*</span>}
                                        </Label>
                                        {isEditing ? (
                                            <>
                                                <textarea
                                                    id="bio"
                                                    value={editForm?.bio || ""}
                                                    onChange={(e) =>
                                                        handleInputChange("bio", e.target.value)
                                                    }
                                                    required
                                                    placeholder="Deskripsi singkat tentang mentor..."
                                                    className={`w-full px-3 py-2 border rounded-md min-h-[100px] ${errors.bio ? "border-red-500" : "border-input"
                                                        }`}
                                                />
                                                {errors.bio && (
                                                    <div className="flex items-center gap-2 text-red-500 text-sm">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.bio}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm border rounded-md px-3 py-2 bg-muted whitespace-pre-wrap">
                                                {currentTeacher.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={isSaving}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Batal
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    {isSaving ? "Menyimpan..." : "Simpan"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="destructive"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    {isDeleting ? "Menghapus..." : "Hapus"}
                                </Button>
                                <Button onClick={handleEdit} disabled={isDeleting}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Guru</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus data guru{" "}
                            <span className="font-semibold">{currentTeacher.fullName}</span>?
                            <br />
                            <br />
                            <span className="text-red-600 font-medium">
                                Tindakan ini tidak dapat dibatalkan.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteAlert(false)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
