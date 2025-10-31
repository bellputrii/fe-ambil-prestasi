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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle>
                            {isEditing ? "Edit Mentor" : "Detail Mentor"}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? "Perbarui informasi profil mentor di bawah ini."
                                : "Lihat dan kelola informasi detail mentor."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4">
                        {/* Profile and Information Layout */}
                        <div className="flex gap-6">
                            {/* Profile Photo - Left Side */}
                            <div className="flex-shrink-0">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
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
                                        <AvatarFallback className="text-xl">
                                            {(isEditing ? editForm?.fullName : currentTeacher.fullName)
                                                ?.split(" ")
                                                .slice(0, 2)
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!isEditing && (
                                        <div className={`absolute -top-1 -right-1 rounded-full p-1 ${currentTeacher.status === "ACTIVE"
                                                ? "bg-green-500"
                                                : "bg-red-500"
                                            }`}>
                                            <div className="h-2 w-2 rounded-full bg-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal Information - Right Side */}
                            <div className="flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-sm font-medium">
                                                Nama Lengkap
                                                {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                        placeholder="Nama lengkap mentor"
                                                        className={errors.fullName ? "border-destructive" : ""}
                                                    />
                                                    {errors.fullName && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.fullName}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-medium">{currentTeacher.fullName}</span>
                                                    <div className={`px-2 py-0.5 text-xs rounded-full ${currentTeacher.status === "ACTIVE"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}>
                                                        {currentTeacher.status === "ACTIVE" ? "Active" : "Inactive"}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="username" className="text-sm font-medium">
                                            Username
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={errors.username ? "border-destructive" : ""}
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.username}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-1 text-sm">@{currentTeacher.username}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="status" className="text-sm font-medium">
                                            Status
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={`w-full h-10 px-3 py-2 rounded-md border ${errors.status ? "border-destructive" : "border-input"
                                                        }`}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                                {errors.status && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.status}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-1 text-sm">
                                                {currentTeacher.status === "ACTIVE" ? "Active" : "Inactive"}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={errors.email ? "border-destructive" : ""}
                                                />
                                                {errors.email && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-1 text-sm">{currentTeacher.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="telp" className="text-sm font-medium">
                                            Nomor Telepon
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={errors.telp ? "border-destructive" : ""}
                                                />
                                                {errors.telp && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.telp}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-1 text-sm">{currentTeacher.phoneNumber}</p>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="specialization" className="text-sm font-medium">
                                            Keahlian
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={errors.specialization ? "border-destructive" : ""}
                                                />
                                                {errors.specialization && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.specialization}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {currentTeacher.specialization.split(',').map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                                    >
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-2">
                                        <Label htmlFor="bio" className="text-sm font-medium">
                                            Bio
                                            {isEditing && <span className="text-destructive ml-1">*</span>}
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
                                                    className={`w-full px-3 py-2 border rounded-md min-h-[100px] ${errors.bio ? "border-destructive" : "border-input"
                                                        }`}
                                                />
                                                {errors.bio && (
                                                    <p className="text-sm text-destructive mt-1">
                                                        {errors.bio}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-2 text-sm whitespace-pre-wrap">
                                                {currentTeacher.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="flex items-center gap-2">
                            {!isEditing && (
                                <Button
                                    variant="destructive"
                                    disabled={isDeleting}
                                    onClick={handleDelete}
                                    size="sm"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                    )}
                                    {isDeleting ? "Menghapus..." : "Hapus"}
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        disabled={isSaving}
                                        size="sm"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Batal
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving} size="sm">
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        {isSaving ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={handleEdit} disabled={isDeleting} size="sm">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>
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
