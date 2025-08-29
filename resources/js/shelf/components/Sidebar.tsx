import React, { useState } from 'react';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";
import MetadataEditor from './MetadataEditor';
import { formatDate, isImagePreviewable } from '../utils/fileUtils';

const Sidebar: React.FC = () => {
    const { selectedFile, deleteFile, replaceFile } = useShelfStore();
    const [replaceMode, setReplaceMode] = useState(false);

    const handleFileReplace = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && selectedFile) {
            replaceFile(selectedFile.id, file);
            setReplaceMode(false);
        }
    };

    const handleOpenFile = () => {
        if (selectedFile) {
            window.open(`/storage/${selectedFile.path}`, '_blank');
        }
    };

    if (!selectedFile) {
        return (
            <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
                <div className="text-center text-gray-500 mt-8">
                    Select a file to view details
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-80 bg-white border-l border-gray-200">
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                <div className="space-y-3">
                    <div
                        className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {isImagePreviewable(selectedFile.mime_type) ? (
                            <img
                                src={`/storage/${selectedFile.path}`}
                                alt={selectedFile.filename}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Icon name={selectedFile.type} className="w-16 h-16 text-gray-400"/>
                        )}
                    </div>
                    <button
                        onClick={handleOpenFile}
                        className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                        {isImagePreviewable(selectedFile.mime_type) ? 'View Full Size' : 'Open File'}
                    </button>
                </div>

                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">{selectedFile.filename}</h3>
                    <div className="space-y-2 text-sm border-t border-b border-gray-200 py-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Size</span>
                            <span className="font-medium text-gray-800">{selectedFile.formatted_size}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Type</span>
                            <span className="font-medium text-gray-800">{selectedFile.type}</span>
                        </div>
                        {selectedFile.mime_type && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">MIME Type</span>
                                <span
                                    className="font-medium text-gray-800 text-xs truncate">{selectedFile.mime_type}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date Created</span>
                            <span className="font-medium text-gray-800">{formatDate(selectedFile.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Last Modified</span>
                            <span className="font-medium text-gray-800">{formatDate(selectedFile.updated_at)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <MetadataEditor file={selectedFile}/>
                </div>

                {selectedFile.fileables && selectedFile.fileables.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-600">Attached To</h4>
                        <div className="space-y-1">
                            {selectedFile.fileables.map((fileable) => (
                                <a
                                    key={`${fileable.type}-${fileable.fileable_id}-${fileable.role}`}
                                    href={`#`}
                                    className="block text-sm text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 p-2 rounded-md"
                                >
                                    <span className="font-medium">{fileable.type} #{fileable.fileable_id}</span>
                                    <span className="text-gray-500"> ({fileable.role})</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                <h4 className="text-sm font-semibold text-gray-600">Actions</h4>
                {replaceMode ? (
                    <div className="space-y-2">
                        <input
                            type="file"
                            onChange={handleFileReplace}
                            className="block w-full text-xs text-gray-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        <button
                            onClick={() => setReplaceMode(false)}
                            className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setReplaceMode(true)}
                        className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        Replace File
                    </button>
                )}
                <button
                    onClick={() => deleteFile(selectedFile.id)}
                    className="w-full rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                >
                    Delete File
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
