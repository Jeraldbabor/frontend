"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { BookOpen, Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/admin/delete-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TeacherAssignment {
    id: number;
    user_id: number;
    grade: string;
    section: string;
    created_at: string;
    user?: { id: number; name: string; email: string } | null;
}

interface TeacherUser {
    id: number;
    name: string;
    email: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<TeacherAssignment[]>([]);
    const [teacherUsers, setTeacherUsers] = useState<TeacherUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherAssignment | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        user_id: "",
        grade: "",
        section: "",
    });
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [teacherToDelete, setTeacherToDelete] =
        useState<TeacherAssignment | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/teachers", {
                params: { search: search || undefined },
            });
            setTeachers(response.data.data);
        } catch (error) {
            console.error("Failed to fetch teachers", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    const fetchTeacherUsers = async () => {
        try {
            const response = await api.get("/admin/users", {
                params: { role: "teacher" },
            });
            setTeacherUsers(response.data.data);
        } catch {
            // Silently fail
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchTeachers(), 500);
        return () => clearTimeout(timer);
    }, [fetchTeachers]);

    const openModal = (mode: "create" | "edit", teacher?: TeacherAssignment) => {
        setFormError("");
        setModalMode(mode);
        fetchTeacherUsers();
        if (mode === "edit" && teacher) {
            setSelectedTeacher(teacher);
            setFormData({
                user_id: teacher.user_id.toString(),
                grade: teacher.grade,
                section: teacher.section,
            });
        } else {
            setSelectedTeacher(null);
            setFormData({ user_id: "", grade: "", section: "" });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);
        try {
            if (modalMode === "create") {
                await api.post("/admin/teachers", formData);
            } else if (selectedTeacher) {
                await api.put(`/admin/teachers/${selectedTeacher.id}`, {
                    grade: formData.grade,
                    section: formData.section,
                });
            }
            setIsModalOpen(false);
            fetchTeachers();
            toast.success(
                `Teacher ${modalMode === "create" ? "assigned" : "updated"} successfully.`
            );
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };
            const errorMsg =
                error.response?.data?.message || "An error occurred.";
            setFormError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const openDeleteModal = (teacher: TeacherAssignment) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!teacherToDelete) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/admin/teachers/${teacherToDelete.id}`);
            setIsDeleteModalOpen(false);
            setTeacherToDelete(null);
            fetchTeachers();
            toast.success("Teacher assignment removed successfully.");
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };
            toast.error(
                error.response?.data?.message ||
                "Failed to remove teacher assignment."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const selectClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <BookOpen className="h-7 w-7 text-primary" />
                        <h1 className="text-3xl font-bold">Teachers</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Assign teachers to grade levels and sections for
                        attendance notifications.
                    </p>
                </div>
                <Button onClick={() => openModal("create")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign Teacher
                </Button>
            </div>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="border-b border-border p-4 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            Teacher Assignments
                        </CardTitle>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search teacher name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b border-border border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Teacher
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Email
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Grade
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Section
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="h-24 text-center"
                                        >
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading teachers...
                                            </span>
                                        </td>
                                    </tr>
                                ) : teachers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No teacher assignments found.
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.map((teacher) => (
                                        <tr
                                            key={teacher.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {teacher.user?.name || "—"}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {teacher.user?.email || "—"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    Grade {teacher.grade}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                    {teacher.section}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            openModal(
                                                                "edit",
                                                                teacher
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                teacher
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                            <CardTitle>
                                {modalMode === "create"
                                    ? "Assign Teacher"
                                    : "Edit Assignment"}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {formError && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {formError}
                                    </div>
                                )}

                                {modalMode === "create" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">Teacher</Label>
                                        <select
                                            id="user_id"
                                            className={selectClass}
                                            value={formData.user_id}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    user_id: e.target.value,
                                                })
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select a teacher...
                                            </option>
                                            {teacherUsers.map((user) => (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                        {teacherUsers.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                No users with &quot;teacher&quot; role
                                                found. Create a user with the
                                                teacher role first.
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="grade">Grade</Label>
                                        <Input
                                            id="grade"
                                            value={formData.grade}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    grade: e.target.value,
                                                })
                                            }
                                            required
                                            placeholder="e.g. 7, 8, 9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section">Section</Label>
                                        <Input
                                            id="section"
                                            value={formData.section}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    section: e.target.value,
                                                })
                                            }
                                            required
                                            placeholder="e.g. A, B, Rose"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={formLoading}
                                    >
                                        {formLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Saving...
                                            </span>
                                        ) : modalMode === "create" ? (
                                            "Assign Teacher"
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setTeacherToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Remove Assignment"
                description={
                    <>
                        Are you sure you want to remove{" "}
                        <strong>{teacherToDelete?.user?.name}</strong> from Grade{" "}
                        {teacherToDelete?.grade} - {teacherToDelete?.section}?
                        They will no longer receive attendance notifications for
                        this section.
                    </>
                }
                isLoading={deleteLoading}
                confirmText="Remove Assignment"
            />
        </div>
    );
}
