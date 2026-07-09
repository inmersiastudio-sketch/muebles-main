import { useState, useRef } from "react";
import { Button } from "./Button";

export function FileUpload({
    apiBase,
    endpoint,
    accept,
    onUploadSuccess,
    buttonText = "Subir archivo",
    disabled = false,
}: {
    apiBase: string;
    endpoint: "/api/upload/image" | "/api/upload/model";
    accept: string;
    onUploadSuccess: (url: string) => void;
    buttonText?: string;
    disabled?: boolean;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input so the same file can be selected again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${apiBase}${endpoint}`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!res.ok) {
                let msg = "Error al subir el archivo";
                try {
                    const errData = await res.json();
                    msg = errData.error || msg;
                } catch {
                    // ignore
                }
                throw new Error(msg);
            }

            const data = await res.json();
            onUploadSuccess(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-1 items-start">
            <input
                type="file"
                ref={fileInputRef}
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    disabled={uploading || disabled}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading ? "Subiendo..." : buttonText}
                </Button>
            </div>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}
