import { useEffect, useState } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

type ProductLogModalProps = {
    productId: number;
    apiBase: string;
    onClose: () => void;
};

export function ProductLogModal({ productId, apiBase, onClose }: ProductLogModalProps) {
    const [logEntries, setLogEntries] = useState<any[]>([]);
    const [logLoading, setLogLoading] = useState(false);
    const [logActionFilter, setLogActionFilter] = useState("");
    const [logFromFilter, setLogFromFilter] = useState("");
    const [logToFilter, setLogToFilter] = useState("");

    const loadLogs = async () => {
        setLogLoading(true);
        setLogEntries([]);
        try {
            const params = new URLSearchParams();
            if (logActionFilter) params.set("action", logActionFilter);
            if (logFromFilter) params.set("from", `${logFromFilter}T00:00:00.000Z`);
            if (logToFilter) params.set("to", `${logToFilter}T23:59:59.999Z`);
            const q = params.toString();
            const res = await fetch(`${apiBase}/api/admin/products/${productId}/logs${q ? `?${q}` : ""}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setLogEntries(data);
            } else {
                console.error("failed loading logs", res.status);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLogLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, [productId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Historial producto #{productId}</h3>
                    <button className="text-gray-600" onClick={onClose}>×</button>
                </div>
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                    <select
                        className="rounded border px-2 py-1 text-sm"
                        value={logActionFilter}
                        onChange={(e) => setLogActionFilter(e.target.value)}
                    >
                        <option value="">Acción</option>
                        <option value="create">create</option>
                        <option value="update">update</option>
                        <option value="delete">delete</option>
                    </select>
                    <Input type="date" value={logFromFilter} onChange={(e) => setLogFromFilter(e.target.value)} />
                    <Input type="date" value={logToFilter} onChange={(e) => setLogToFilter(e.target.value)} />
                    <Button variant="secondary" onClick={loadLogs}>
                        Filtrar
                    </Button>
                </div>
                {logLoading ? (
                    <p>Cargando...</p>
                ) : logEntries.length === 0 ? (
                    <p className="text-sm text-slate-600">No hay registros</p>
                ) : (
                    <ul className="text-sm space-y-2 max-h-80 overflow-y-auto">
                        {logEntries.map((entry: any) => (
                            <li key={entry.id} className="border-b pb-1">
                                <div className="flex justify-between">
                                    <span className="font-semibold">{entry.action}</span>
                                    <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-xs text-slate-600">por {entry.actor ?? entry.userName ?? entry.userEmail ?? "desconocido"}</div>
                                {entry.data?.summary && <div className="text-xs mt-1">{entry.data.summary}</div>}
                                {entry.data?.changedFields?.length ? (
                                    <div className="text-xs mt-1">Campos: {entry.data.changedFields.join(", ")}</div>
                                ) : null}
                                {entry.data && <pre className="text-xs bg-slate-100 p-1 mt-1 overflow-x-auto">{JSON.stringify(entry.data, null, 2)}</pre>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
