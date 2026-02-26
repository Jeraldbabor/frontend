"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

// lucide-react icons
import { Users, Plus, Pencil, Trash2, Search, X } from "lucide-react";

// sonner for toast notifications
import { toast } from "sonner";

import { DeleteModal } from "@/components/admin/delete-modal";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    role: "superadmin" | "admin" | "teacher" | "principal" | "parent" | "student";
    created_at: string;
    school_id?: number | null;
    school?: {
        id: number;
        name: string;
    } | null;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "student",
    });
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/admin/users", {
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
            });
        } else {
            setSelectedUser(null);
            setFormData({
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "student",
            });
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
            const payload: Record<string, string> = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            if (modalMode === "create") {
                await api.post("/admin/users", payload);
            } else if (modalMode === "edit" && selectedUser) {
                await api.put(`/admin/users/${selectedUser.id}`, payload);
            }
            setIsModalOpen(false);
            fetchData(); // Refresh list
            toast.success(`User ${modalMode === "create" ? "created" : "updated"} successfully.`);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || "An error occurred.";
            setFormError(errorMsg);
            toast.error(errorMsg);
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
            await api.delete(`/admin/users/${userToDelete.id}`);
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
                                            <td className="p-4 align-middle font-medium">{user.name}</td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {user.email}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.role === "superadmin"
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                                        : user.role === "admin"
                                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                            : user.role === "teacher"
                                                                ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400"
                                                                : user.role === "principal"
                                                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                                                    : user.role === "parent"
                                                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        }`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
                            <CardTitle>
                                {modalMode === "create" ? "Add New User" : "Edit User"}
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
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                    >
                                        <option value="student">Student</option>
                                        <option value="parent">Parent</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="principal">Principal</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>


                                <div className="space-y-2">
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

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
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
