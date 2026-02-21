"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

// lucide-react icons
import { Building, Plus, Pencil, Trash2, Search, X } from "lucide-react";

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
interface University {
    id: number;
    name: string;
    created_at: string;
}

export default function UniversitiesPage() {
    const [universities, setUniversities] = useState<University[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
    });
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Fetch universities from API
    const fetchUniversities = async () => {
        setLoading(true);
        try {
            const response = await api.get("/superadmin/universities");
            // API resource without pagination returns array
            let data = response.data;
            if (search) {
                const lowerSearch = search.toLowerCase();
                data = data.filter((u: University) => u.name.toLowerCase().includes(lowerSearch));
            }
            setUniversities(data);
        } catch (error) {
            console.error("Failed to fetch universities", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when search changes, with a small debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUniversities();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open Modal for Create or Edit
    const openModal = (mode: "create" | "edit", university?: University) => {
        setFormError("");
        setModalMode(mode);
        if (mode === "edit" && university) {
            setSelectedUniversity(university);
            setFormData({
                name: university.name,
            });
        } else {
            setSelectedUniversity(null);
            setFormData({
                name: "",
            });
        }
        setIsModalOpen(true);
    };

    // Handle Form Submission (Create or Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        setFormLoading(true);

        try {
            if (modalMode === "create") {
                await api.post("/superadmin/universities", {
                    name: formData.name,
                });
            } else if (modalMode === "edit" && selectedUniversity) {
                await api.put(`/superadmin/universities/${selectedUniversity.id}`, {
                    name: formData.name,
                });
            }
            setIsModalOpen(false);
            fetchUniversities(); // Refresh list
            toast.success(`University ${modalMode === "create" ? "created" : "updated"} successfully.`);
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
    const openDeleteModal = (university: University) => {
        setUniversityToDelete(university);
        setIsDeleteModalOpen(true);
    };

    // Handle Delete University Confirm
    const handleDeleteConfirm = async () => {
        if (!universityToDelete) return;

        setDeleteLoading(true);
        try {
            await api.delete(`/superadmin/universities/${universityToDelete.id}`);
            setIsDeleteModalOpen(false);
            setUniversityToDelete(null);
            fetchUniversities(); // Refresh list
            toast.success("University deleted successfully.");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to delete university.");
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
                        <Building className="h-7 w-7 text-primary" />
                        <h1 className="text-3xl font-bold">Universities</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage multi-tenant university instances within the system.
                    </p>
                </div>
                <Button onClick={() => openModal("create")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add University
                </Button>
            </div>

            {/* Main Content Card */}
            <Card>
                <CardHeader className="border-b border-border p-4 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">All Universities</CardTitle>
                        {/* Search Bar */}
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search university name..."
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
                                        University Name
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {loading ? (
                                    <tr>
                                        <td colSpan={2} className="h-24 text-center">
                                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                                Loading universities...
                                            </span>
                                        </td>
                                    </tr>
                                ) : universities.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="h-24 text-center text-muted-foreground">
                                            No universities found.
                                        </td>
                                    </tr>
                                ) : (
                                    universities.map((university) => (
                                        <tr
                                            key={university.id}
                                            className="border-b border-border transition-colors hover:bg-muted/50"
                                        >
                                            <td className="p-4 align-middle font-medium">{university.name}</td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openModal("edit", university)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => openDeleteModal(university)}
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
                                {modalMode === "create" ? "Add New University" : "Edit University"}
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
                                    <Label htmlFor="name">University Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>

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
                                            "Create University"
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
                    setUniversityToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                description={
                    <>
                        Are you sure you want to delete the university <strong>{universityToDelete?.name}</strong>? This action cannot be undone.
                    </>
                }
                isLoading={deleteLoading}
                confirmText="Delete University"
            />
        </div>
    );
}
