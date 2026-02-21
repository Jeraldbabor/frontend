import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description: React.ReactNode;
    isLoading?: boolean;
    confirmText?: string;
}

export function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    description,
    isLoading = false,
    confirmText = "Delete",
}: DeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-lg animate-in zoom-in-95 duration-200 border-destructive">
                <CardHeader className="flex flex-row items-center gap-3 border-b border-border pb-4 text-destructive">
                    <AlertTriangle className="h-6 w-6" />
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="text-muted-foreground mb-4">
                        {description}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Deleting...
                                </span>
                            ) : (
                                confirmText
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
