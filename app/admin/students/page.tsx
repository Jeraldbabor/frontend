"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import {
    GraduationCap,
    Plus,
    Pencil,
    Trash2,
    Search,
    X,
    CreditCard,
    UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/admin/delete-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    grade: string;
    section: string;
    rfid_code: string | null;
    student_id_number: string;
    parent_id: number | null;
    profile_image_url?: string | null;
    parent?: { id: number; name: string; email: string } | null;
    created_at: string;
}

interface ParentUser {
    id: number;
    name: string;
    email: string;
}

interface TeacherAssignment {
    id: number;
    user_id: number;
    grade: string;
    section: string;
    user?: { id: number; name: string; email: string } | null;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<ParentUser[]>([]);
    const [teachers, setTeachers] = useState<TeacherAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        first_name: string;
        last_name: string;
        grade: string;
        section: string;
        student_id_number: string;
        rfid_code: string;
        parent_id: string;
        profile_image: File | null;
    }>({
        first_name: "",
        last_name: "",
        grade: "",
        section: "",
        student_id_number: "",
        rfid_code: "",
        parent_id: "",
        profile_image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/students", {
                params: {
                    search: search || undefined,
                    grade: gradeFilter || undefined,
                    section: sectionFilter || undefined,
                },
            });
            setStudents(response.data.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    }, [search, gradeFilter, sectionFilter]);

    const fetchParents = async () => {
        try {
            const response = await api.get("/admin/users", {
                params: { role: "parent" },
            });
            setParents(response.data.data);
        } catch {
            // Silently fail — parents list is optional
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await api.get("/admin/teachers");
            setTeachers(response.data.data);
        } catch {
            // Silently fail — teachers list is optional
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchStudents(), 500);
        return () => clearTimeout(timer);
    }, [fetchStudents]);

    const openModal = (mode: "create" | "edit", student?: Student) => {
        setFormError("");
        setModalMode(mode);
        fetchParents();
        fetchTeachers();
        if (mode === "edit" && student) {
            setSelectedStudent(student);
            setFormData({
                first_name: student.first_name,
                last_name: student.last_name,
                grade: student.grade,
                section: student.section,
                student_id_number: student.student_id_number,
                rfid_code: student.rfid_code || "",
                parent_id: student.parent_id?.toString() || "",
                profile_image: null,
            });
            setImagePreview(student.profile_image_url || null);
        } else {
            setSelectedStudent(null);
            setFormData({
                first_name: "",
                last_name: "",
                grade: "",
                section: "",
                student_id_number: "",
                rfid_code: "",
                parent_id: "",
                profile_image: null,
            });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            const payload = new FormData();
            payload.append("first_name", formData.first_name);
            payload.append("last_name", formData.last_name);
            payload.append("grade", formData.grade);
            payload.append("section", formData.section);
            payload.append("student_id_number", formData.student_id_number);
            if (formData.rfid_code) payload.append("rfid_code", formData.rfid_code);
            if (formData.parent_id) payload.append("parent_id", formData.parent_id);
            if (formData.profile_image) payload.append("profile_image", formData.profile_image);

            if (modalMode === "create") {
                await api.post("/admin/students", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else if (selectedStudent) {
                payload.append("_method", "PUT");
                await api.post(`/admin/students/${selectedStudent.id}`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            if (imagePreview && !imagePreview.startsWith('http')) {
                URL.revokeObjectURL(imagePreview);
            }
            setIsModalOpen(false);
            fetchStudents();
            toast.success(
                `Student ${modalMode === "create" ? "created" : "updated"} successfully.`
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
            if (imagePreview && !imagePreview.startsWith('http')) {
                URL.revokeObjectURL(imagePreview);
            }
        }
    };

    const openDeleteModal = (student: Student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!studentToDelete) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/admin/students/${studentToDelete.id}`);
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
            fetchStudents();
            toast.success("Student deleted successfully.");
        } catch (err: unknown) {
            const error = err as {
                response?: { data?: { message?: string } };
            };
            toast.error(
                error.response?.data?.message || "Failed to delete student."
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
                        <GraduationCap className="h-7 w-7 text-primary" />
                        <h1 className="text-3xl font-bold">Students</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage enrolled students and assign RFID cards for gate
                        scanning.
                    </p>
                </div>
                <Button onClick={() => openModal("create")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Student
                </Button>
            </div>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="border-b border-border p-4 pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">All Students</CardTitle>
                        <div className="flex items-center gap-2">
                            {/* Grade Filter */}
                            <Input
                                placeholder="Grade"
                                value={gradeFilter}
                                onChange={(e) => setGradeFilter(e.target.value)}
                                className="w-24"
                            />
                            {/* Section Filter */}
                            <Input
                                placeholder="Section"
                                value={sectionFilter}
                                onChange={(e) =>
                                    setSectionFilter(e.target.value)
                                }
                                className="w-24"
                            />
                            {/* Search */}
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search name, ID, RFID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b border-border border-b bg-muted/50">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Student ID
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Name
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Grade & Section
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        RFID
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                        Parent
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
                                            colSpan={6}
                                            className="h-24 text-center"
                                        >
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading students...
                                            </span>
                                        </td>
                                    </tr>
                                ) : students.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-mono text-sm text-muted-foreground">
                                                {student.student_id_number}
                                            </td>
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-3">
                                                    {student.profile_image_url ? (
                                                        <img src={student.profile_image_url} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                                                    ) : (
                                                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                    {student.first_name}{" "}
                                                    {student.last_name}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    Grade {student.grade} -{" "}
                                                    {student.section}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {student.rfid_code ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <CreditCard className="h-3 w-3" />
                                                        {student.rfid_code}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                        Not Assigned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {student.parent?.name || "—"}
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
                                                                student
                                                            )
                                                        }
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Edit
                                                        </span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() =>
                                                            openDeleteModal(
                                                                student
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Delete
                                                        </span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-xl shadow-2xl border-0 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/30">
                            <div>
                                <CardTitle className="text-xl">
                                    {modalMode === "create"
                                        ? "Add New Student"
                                        : "Edit Student Details"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {modalMode === "create" ? "Enter the details for the new student entry." : "Update the information and class assignments below."}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                                onClick={() => {
                                    if (imagePreview && !imagePreview.startsWith('http')) {
                                        URL.revokeObjectURL(imagePreview);
                                    }
                                    setIsModalOpen(false);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                {formError && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {formError}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">
                                            First Name
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    first_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    last_name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="student_id_number">
                                        Student ID Number
                                    </Label>
                                    <Input
                                        id="student_id_number"
                                        value={formData.student_id_number}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                student_id_number:
                                                    e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2 relative z-50">
                                    <Label>Assign Teacher / Class (Optional)</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "None / Clear Selection", value: "" },
                                            ...teachers.map((teacher) => ({
                                                label: `${teacher.user?.name} — Grade ${teacher.grade} / ${teacher.section}`,
                                                value: teacher.id.toString(),
                                            })),
                                        ]}
                                        value={""} // We don't necessarily need to bind value strictly here since it auto-fills grade/section, but could bind to a dummy state if needed.
                                        onChange={(teacherId) => {
                                            if (teacherId) {
                                                const teacher = teachers.find(
                                                    (t) => t.id.toString() === teacherId
                                                );
                                                if (teacher) {
                                                    setFormData({
                                                        ...formData,
                                                        grade: teacher.grade,
                                                        section: teacher.section,
                                                    });
                                                }
                                            }
                                        }}
                                        placeholder="Search for a teacher to auto-fill Grade & Section..."
                                        searchPlaceholder="Search teacher name..."
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">Search and select a teacher to automatically fill the Grade and Section fields below.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 relative" style={{ zIndex: 45 }}>
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

                                <div className="space-y-2">
                                    <Label htmlFor="rfid_code">
                                        RFID Code{" "}
                                        <span className="text-muted-foreground font-normal">
                                            (Optional — scan or type)
                                        </span>
                                    </Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="rfid_code"
                                            value={formData.rfid_code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    rfid_code: e.target.value,
                                                })
                                            }
                                            className="pl-9"
                                            placeholder="Tap RFID card or type code..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 relative z-40">
                                    <Label htmlFor="parent_id">
                                        Parent Account{" "}
                                        <span className="text-muted-foreground font-normal">
                                            (Optional)
                                        </span>
                                    </Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "No Parent Linked", value: "" },
                                            ...parents.map((parent) => ({
                                                label: `${parent.name} (${parent.email})`,
                                                value: parent.id.toString(),
                                            })),
                                        ]}
                                        value={formData.parent_id || ""}
                                        onChange={(val) => setFormData({ ...formData, parent_id: val })}
                                        placeholder="Search for a parent..."
                                        searchPlaceholder="Search name or email..."
                                    />
                                </div>

                                <div className="space-y-3 pt-2 h-max">
                                    <Label htmlFor="profile_image">Profile Image (Optional)</Label>

                                    <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center">
                                        <div className="h-16 w-16 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1 w-full relative">
                                            <Input
                                                id="profile_image"
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg"
                                                className="cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setFormData({ ...formData, profile_image: file });

                                                    // Handle Image Preview
                                                    if (file) {
                                                        const objectUrl = URL.createObjectURL(file);
                                                        setImagePreview(objectUrl);
                                                    } else if (modalMode === "edit" && selectedStudent?.profile_image_url) {
                                                        setImagePreview(selectedStudent.profile_image_url);
                                                    } else {
                                                        setImagePreview(null);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                Accepted formats: JPEG, PNG, JPG. Max size: 2MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-border/50 mt-6">
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
                                            "Create Student"
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
                    setStudentToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                description={
                    <>
                        Are you sure you want to delete the student{" "}
                        <strong>
                            {studentToDelete?.first_name}{" "}
                            {studentToDelete?.last_name}
                        </strong>
                        ? This will also delete all attendance records. This
                        action cannot be undone.
                    </>
                }
                isLoading={deleteLoading}
                confirmText="Delete Student"
            />
        </div>
    );
}
