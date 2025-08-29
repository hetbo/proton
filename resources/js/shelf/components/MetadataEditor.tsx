import React, { useState } from 'react';
import { ShelfFile } from '../types/types';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";

const MetadataEditor: React.FC<{ file: ShelfFile }> = ({ file }) => {
    const { addMetadata, updateMetadata, deleteMetadata } = useShelfStore();
    const [editingMeta, setEditingMeta] = useState<number | null>(null);
    const [newMeta, setNewMeta] = useState({ key: '', value: '' });
    const [editValues, setEditValues] = useState({ key: '', value: '' });

    const handleAddMetadata = async () => {
        if (newMeta.key && newMeta.value) {
            await addMetadata(file.id, newMeta.key, newMeta.value);
            setNewMeta({ key: '', value: '' });
        }
    };

    const handleEditMetadata = async (id: number) => {
        if (editValues.key && editValues.value) {
            await updateMetadata(id, editValues.key, editValues.value);
            setEditingMeta(null);
        }
    };

    const startEdit = (meta: any) => {
        setEditingMeta(meta.id);
        setEditValues({ key: meta.key, value: meta.value });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Metadata</h4>

            <div className="space-y-2">
                {file.metadata?.map((meta) => (
                    <div key={meta.id} className="group flex items-center justify-between p-2.5 bg-gray-50 rounded-md">
                        {editingMeta === meta.id ? (
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={editValues.key}
                                        onChange={(e) => setEditValues({ ...editValues, key: e.target.value })}
                                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={editValues.value}
                                        onChange={(e) => setEditValues({ ...editValues, value: e.target.value })}
                                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <button
                                        onClick={() => handleEditMetadata(meta.id)}
                                        className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingMeta(null)}
                                        className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{meta.key}</p>
                                    <p className="text-xs text-gray-500 truncate">{meta.value}</p>
                                </div>
                                <div
                                    className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(meta)}
                                        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                                    >
                                        <Icon name="edit" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMetadata(meta.id)}
                                        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600"
                                    >
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-2 border-t border-gray-200/75 pt-4">
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        placeholder="Key"
                        value={newMeta.key}
                        onChange={(e) => setNewMeta({ ...newMeta, key: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        value={newMeta.value}
                        onChange={(e) => setNewMeta({ ...newMeta, value: e.target.value })}
                        className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleAddMetadata}
                        className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Add Metadata
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MetadataEditor;
