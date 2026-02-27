"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

// lucide-react icons
import { Users, Plus, Pencil, Trash2, Search, X, UserCircle } from "lucide-react";

// sonner for toast notifications
import { toast } from "sonner";

import { DeleteModal } from "@/components/admin/delete-modal";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

// Types
interface User {
    id: number;
    name: string;
    email: string;
    role: "superadmin" | "admin" | "parent" | "student";
    created_at: string;
    school_id?: number | null;
    profile_image_url?: string | null;
    school?: {
        id: number;
        name: string;
    } | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Superadmin data
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [schools, setSchools] = useState<{ id: number, name: string }[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        school_id: string;
        profile_image: File | null;
    }>({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "student",
        school_id: "",
        profile_image: null,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch users and current user from API
    const fetchData = async () => {
        setLoading(true);
        try {
            if (!currentUser) {
                // We know it is a superadmin layout, but we still need the list of schools
                const uniRes = await api.get("/superadmin/schools");
                setSchools(uniRes.data);

                // Keep dummy auth locally just for UI consistency down below without rewriting too much
                setCurrentUser({ id: 0, name: "", email: "", role: "superadmin", created_at: new Date().toISOString() });
            }

            const response = await api.get("/superadmin/users", {
                params: { search },
            });
            // Laravel pagination returns { data: [...] }
            setUsers(response.data.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when search changes, with a small debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open Modal for Create or Edit
    const openModal = (mode: "create" | "edit", user?: User) => {
        setFormError("");
        setModalMode(mode);
        if (mode === "edit" && user) {
            setSelectedUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: "", // Leave blank unless changing
                password_confirmation: "",
                role: user.role,
                school_id: user.school_id ? user.school_id.toString() : "",
                profile_image: null,
            });
            setImagePreview(user.profile_image_url || null);
        } else {
            setSelectedUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "student",
                school_id: "",
                profile_image: null,
            });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    // Handle Form Submission (Create or Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        if (formData.password && formData.password !== formData.password_confirmation) {
            setFormError("Passwords do not match.");
            setFormLoading(false);
            return;
        }

        try {
            const payload = new FormData();
            payload.append("name", formData.name);
            payload.append("email", formData.email);
            payload.append("role", formData.role);
            if (formData.password) {
                payload.append("password", formData.password);
            }
            if (currentUser?.role === "superadmin" && formData.school_id) {
                payload.append("school_id", formData.school_id);
            }
            if (formData.profile_image) {
                payload.append("profile_image", formData.profile_image);
            }

            if (modalMode === "create") {
                await api.post("/superadmin/users", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else if (modalMode === "edit" && selectedUser) {
                payload.append("_method", "PUT");
                await api.post(`/superadmin/users/${selectedUser.id}`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            if (imagePreview && !imagePreview.startsWith('http')) {
                // Revoke object URL to avoid memory leaks if it was locally created
                URL.revokeObjectURL(imagePreview);
            }
            setIsModalOpen(false);
            fetchData(); // Refresh list
            toast.success(`User ${modalMode === "create" ? "created" : "updated"} successfully.`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || "An error occurred.";
            setFormError(errorMsg);
            toast.error(errorMsg);
            if (imagePreview && !imagePreview.startsWith('http')) {
                URL.revokeObjectURL(imagePreview);
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Open Delete Modal
    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    // Handle Delete User Confirm
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleteLoading(true);
        try {
            await api.delete(`/superadmin/users/${userToDelete.id}`);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
            fetchData(); // Refresh list
            toast.success("User deleted successfully.");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to delete user.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Users className="h-7 w-7 text-primary" />
                        <h1 className="text-3xl font-bold">Users</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage system administrators, parents, and students.
                    </p>
                </div>
                <Button onClick={() => openModal("create")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                </Button>
            </div>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="border-b border-border p-4 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">All Users</CardTitle>
                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search name or email..."
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
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                        Name
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                        Email
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                        Role
                                    </th>
                                    {currentUser?.role === "superadmin" && (
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                                            School
                                        </th>
                                    )}
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="h-24 text-center">
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading users...
                                            </span>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-3">
                                                    {user.profile_image_url ? (
                                                        <img src={user.profile_image_url} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                                                    ) : (
                                                        <UserCircle className="h-8 w-8 text-muted-foreground" />
                                                    )}
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "superadmin"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                        : user.role === "admin"
                                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                            : user.role === "parent"
                                                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
                                            {currentUser?.role === "superadmin" && (
                                                <td className="p-4 align-middle">
                                                    {user.school ? user.school.name : (
                                                        <span className="text-muted-foreground italic">None</span>
                                                    )}
                                                </td>
                                            )}
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openModal("edit", user)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => openDeleteModal(user)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">Delete</span>
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

            {/* Basic Custom Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-xl shadow-2xl border-0 animate-in zoom-in-95 duration-200 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4 bg-muted/30">
                            <div>
                                <CardTitle className="text-xl">
                                    {modalMode === "create" ? "Add New User" : "Edit User Details"}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {modalMode === "create" ? "Create a new user profile with a specific role." : "Update the user's information and system role."}
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
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {formError && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {formError}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2 relative" style={{ zIndex: 60 }}>
                                    <Label htmlFor="role">Role</Label>
                                    <SearchableSelect
                                        options={[
                                            { label: "Admin - Full Dashboard Access", value: "admin" },
                                            { label: "Principal - Dashboard Analytics", value: "principal" },
                                            { label: "Teacher - Specific Section Manager", value: "teacher" },
                                            { label: "Parent - Mobile App Access", value: "parent" },
                                            { label: "Student - Mobile App Access", value: "student" },
                                            ...(currentUser?.role === "superadmin" ? [{ label: "Superadmin - System Operator", value: "superadmin" }] : [])
                                        ]}
                                        value={formData.role}
                                        onChange={(val) => setFormData({ ...formData, role: val })}
                                        placeholder="Select a user role..."
                                        searchPlaceholder="Search roles..."
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5">Roles determine what layout and functions the user can access.</p>
                                </div>

                                {currentUser?.role === "superadmin" && (
                                    <div className="space-y-2 relative" style={{ zIndex: 50 }}>
                                        <Label htmlFor="school_id">School</Label>
                                        <SearchableSelect
                                            options={[
                                                { label: "No School (Global)", value: "" },
                                                ...schools.map(u => ({ label: u.name, value: u.id.toString() }))
                                            ]}
                                            value={formData.school_id}
                                            onChange={(val) => setFormData({ ...formData, school_id: val })}
                                            placeholder="Assign to a specific school..."
                                            searchPlaceholder="Search schools..."
                                        />
                                    </div>
                                )}

                                <div className="space-y-3 pt-2">
                                    <Label htmlFor="profile_image">Profile Image (Optional)</Label>

                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <UserCircle className="h-8 w-8 text-muted-foreground opacity-50" />
                                            )}
                                        </div>
                                        <div className="flex-1">
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
                                                    } else if (modalMode === "edit" && selectedUser?.profile_image_url) {
                                                        setImagePreview(selectedUser.profile_image_url);
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

                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="password">
                                        Password{" "}
                                        {modalMode === "edit" && (
                                            <span className="text-muted-foreground font-normal">
                                                (Leave blank to keep current)
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        required={modalMode === "create"}
                                        minLength={6}
                                    />
                                </div>

                                {/* Password Confirmation */}
                                {((modalMode === "create") || (modalMode === "edit" && formData.password.length > 0)) && (
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={formData.password_confirmation}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    password_confirmation: e.target.value,
                                                })
                                            }
                                            required={
                                                modalMode === "create" || formData.password.length > 0
                                            }
                                            minLength={6}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4 border-t mt-6 border-border/50">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (imagePreview && !imagePreview.startsWith('http')) {
                                                URL.revokeObjectURL(imagePreview);
                                            }
                                            setIsModalOpen(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={formLoading}>
                                        {formLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Saving...
                                            </span>
                                        ) : modalMode === "create" ? (
                                            "Create User"
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
                    setUserToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                description={
                    <>
                        Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? This action cannot be undone.
                    </>
                }
                isLoading={deleteLoading}
                confirmText="Delete User"
            />
        </div>
    );
}
