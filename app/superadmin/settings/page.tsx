"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// lucide-react icons
import { Settings, KeyRound, Trash2, AlertTriangle } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

/**
 * Settings Page
 *
 * Two sections:
 * 1. Change Password — update admin password
 * 2. Delete Account — danger zone with password confirmation
 */
export default function SettingsPage() {
    const router = useRouter();

    // --- Change Password State ---
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // --- Delete Account State ---
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    /**
     * Handle password update
     * Sends PUT /api/admin/password
     */
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");
        setPasswordLoading(true);

        try {
            const response = await api.put("/admin/password", {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });

            setPasswordSuccess(response.data.message);
            // Clear form on success
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setPasswordError(
                error.response?.data?.message || "Failed to update password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    /**
     * Handle account deletion
     * Sends DELETE /api/admin/account
     */
    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteError("");
        setDeleteLoading(true);

        try {
            await api.delete("/admin/account", {
                data: { password: deletePassword },
            });

            // Clear auth and redirect to login
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; max-age=0";
            router.push("/portal-campuseye3x101");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setDeleteError(
                error.response?.data?.message || "Failed to delete account."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <Settings className="h-7 w-7 text-primary" />
                    <h1 className="text-3xl font-bold">Settings</h1>
                </div>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* ===== Change Password Section ===== */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <KeyRound className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            {/* Success message */}
                            {passwordSuccess && (
                                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
                                    {passwordSuccess}
                                </div>
                            )}

                            {/* Error message */}
                            {passwordError && (
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    {passwordError}
                                </div>
                            )}

                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Confirm New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button type="submit" disabled={passwordLoading}>
                                {passwordLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        Updating...
                                    </span>
                                ) : (
                                    "Update Password"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ===== Delete Account Section (Danger Zone) ===== */}
                <Card className="border-destructive/30">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <CardTitle className="text-destructive">
                                    Delete Account
                                </CardTitle>
                                <CardDescription>
                                    Permanently delete your account and all associated data. This
                                    action cannot be undone.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!showDeleteConfirm ? (
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        ) : (
                            <form onSubmit={handleDeleteAccount} className="space-y-4">
                                {/* Warning */}
                                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                    <div className="flex items-center gap-2 font-medium">
                                        <AlertTriangle className="h-4 w-4" />
                                        This action is irreversible!
                                    </div>
                                    <p className="mt-1">
                                        Enter your password to confirm account deletion.
                                    </p>
                                </div>

                                {/* Error message */}
                                {deleteError && (
                                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {deleteError}
                                    </div>
                                )}

                                {/* Password confirmation */}
                                <div className="space-y-2">
                                    <Label htmlFor="delete_password">Password</Label>
                                    <Input
                                        id="delete_password"
                                        type="password"
                                        placeholder="Enter your password to confirm"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Deleting...
                                            </span>
                                        ) : (
                                            "Confirm Delete"
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeletePassword("");
                                            setDeleteError("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
