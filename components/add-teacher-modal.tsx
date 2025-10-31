"use client";

import React, { useState } from "react";
import { Teacher } from "@/types/teacher";
import { createTeacher } from "@/lib/api/teachers";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/optimized-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema sesuai dengan backend
const teacherCreateSchema = z.object({
    name: z
        .string()
        .min(4, "Nama harus minimal 4 karakter")
        .max(100, "Nama maksimal 100 karakter"),
    username: z
        .string()
        .min(4, "Username harus minimal 4 karakter")
        .max(50, "Username maksimal 50 karakter"),
    email: z.string().email("Email tidak valid"),
    telp: z
        .string()
        .min(10, "Nomor telepon harus minimal 10 karakter")
        .max(15, "Nomor telepon maksimal 15 karakter"),
    status: z.enum(["ACTIVE", "INACTIVE"]),
    specialization: z.string().max(255, "Keahlian maksimal 255 karakter"),
    bio: z.string().max(1000, "Bio maksimal 1000 karakter"),
});

interface AddTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (teacher: Teacher) => void;
}

export function AddTeacherModal({
    isOpen,
    onClose,
    onAdd,
}: AddTeacherModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        telp: "",
        status: "ACTIVE" as "ACTIVE" | "INACTIVE",
        specialization: "",
        bio: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        username?: string;
        email?: string;
        telp?: string;
        status?: string;
        specialization?: string;
        bio?: string;
    }>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        // Clear error untuk field yang sedang diubah
        if (errors[field as keyof typeof errors]) {
            setErrors((prev) => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi form data
        try {
            teacherCreateSchema.parse(formData);
            setErrors({}); // Clear errors jika validasi berhasil
        } catch (error) {
            if (error instanceof z.ZodError) {
                const fieldErrors: { name?: string; username?: string; email?: string } = {};
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

        setIsLoading(true);

        try {
            const newTeacher = await createTeacher(formData);
            onAdd(newTeacher);
            toast.success("Guru baru berhasil ditambahkan");

            // Reset form
            setFormData({
                name: "",
                username: "",
                email: "",
                telp: "",
                status: "ACTIVE",
                specialization: "",
                bio: "",
            });
            setErrors({});

            onClose();
        } catch (error: unknown) {
            console.error("Error creating teacher:", error);

            // Handle backend validation errors
            const err = error as { validationErrors?: Record<string, string[]>; message?: string };
            if (err.validationErrors) {
                const backendErrors: { name?: string; username?: string; email?: string } = {};

                // Map backend errors to form fields
                Object.keys(err.validationErrors).forEach((field) => {
                    const errorMessages = err.validationErrors?.[field];
                    if (errorMessages && errorMessages.length > 0) {
                        backendErrors[field as keyof typeof backendErrors] = errorMessages[0];
                    }
                });

                setErrors(backendErrors);

                // Show specific error messages
                if (backendErrors.email) {
                    toast.error(backendErrors.email);
                }
                if (backendErrors.username) {
                    toast.error(backendErrors.username);
                }
                if (backendErrors.name) {
                    toast.error(backendErrors.name);
                }
            } else {
                toast.error(err.message || "Gagal menambahkan guru. Silakan coba lagi.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            name: "",
            username: "",
            email: "",
            telp: "",
            status: "ACTIVE",
            specialization: "",
            bio: "",
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center">Tambah Guru Baru</DialogTitle>
                    <div className="text-sm text-muted-foreground text-center mt-2">
                        <p>
                            Password default akan diset otomatis. Guru dapat mengubah password
                            setelah login pertama.
                        </p>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Nama lengkap guru (minimal 4 karakter)"
                                required
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username *</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                                placeholder="username (minimal 4 karakter)"
                                required
                                className={errors.username ? "border-red-500" : ""}
                            />
                            {errors.username && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.username}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="email@example.com"
                                required
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telp">Nomor Telepon *</Label>
                            <Input
                                id="telp"
                                value={formData.telp}
                                onChange={(e) => handleInputChange("telp", e.target.value)}
                                placeholder="+62 812-3456-7890"
                                required
                                className={errors.telp ? "border-red-500" : ""}
                            />
                            {errors.telp && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.telp}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleInputChange("status", e.target.value as "ACTIVE" | "INACTIVE")}
                                className={`w-full px-3 py-2 border rounded-md ${errors.status ? "border-red-500" : "border-input"}`}
                                required
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            {errors.status && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.status}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="specialization">Keahlian * (pisahkan dengan koma)</Label>
                            <Input
                                id="specialization"
                                value={formData.specialization}
                                onChange={(e) => handleInputChange("specialization", e.target.value)}
                                placeholder="Essay Writing, Academic Writing, Research"
                                required
                                className={errors.specialization ? "border-red-500" : ""}
                            />
                            {errors.specialization && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.specialization}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio">Bio *</Label>
                            <textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleInputChange("bio", e.target.value)}
                                placeholder="Deskripsi singkat tentang mentor..."
                                required
                                className={`w-full px-3 py-2 border rounded-md min-h-[100px] ${errors.bio ? "border-red-500" : "border-input"}`}
                            />
                            {errors.bio && (
                                <div className="flex items-center gap-1 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{errors.bio}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            {isLoading ? "Menambah..." : "Tambah Guru"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
