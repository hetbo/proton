import React, { useState } from 'react';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";
import { formatFileSize } from '../utils/fileUtils';

const UploadModal: React.FC = () => {
    const { uploadModalOpen, setUploadModalOpen, uploadFile } = useShelfStore();
    const [dragActive, setDragActive] = useState(false);
    const [uploadQueue, setUploadQueue] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        setUploadQueue(prev => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadQueue(prev => [...prev, ...files]);
        }
    };

    const removeFromQueue = (index: number) => {
        setUploadQueue(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (uploadQueue.length === 0) return;

        setUploading(true);
        try {
            for (const file of uploadQueue) {
                await uploadFile(file);
            }
            setUploadQueue([]);
            setUploadModalOpen(false);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    if (!uploadModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div
                    className="relative w-full max-w-lg transform text-left align-middle bg-white shadow-xl rounded-2xl transition-all">
                    <div
                        className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
                        <h3 className="text-xl font-semibold text-gray-800">Upload Files</h3>
                        <button
                            onClick={() => setUploadModalOpen(false)}
                            className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-700 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        >
                            <span className="h-6 w-6 text-2xl block outline-none focus:outline-none">×</span>
                        </button>
                    </div>

                    <div className="relative p-6 flex-auto">
                        {uploadQueue.length === 0 ? (
                            <div
                                className={`relative block w-full rounded-lg border-2 border-dashed p-12 text-center transition-colors
                            ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <Icon name="upload" className="mx-auto h-12 w-12 text-gray-400"/>
                                <span className="mt-2 block text-sm font-semibold text-gray-800">
                            Drag and drop files here
                        </span>
                                <span className="mt-1 block text-xs text-gray-500">or</span>
                                <label
                                    className="mt-4 inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 cursor-pointer">
                                    Select Files
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileSelect}
                                        className="sr-only"
                                    />
                                </label>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        Upload Queue ({uploadQueue.length})
                                    </h4>
                                    <label
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                                        Add More
                                        <input type="file" multiple onChange={handleFileSelect} className="sr-only"/>
                                    </label>
                                </div>
                                <div
                                    className="max-h-60 overflow-y-auto pr-2 -mr-2 space-y-2 rounded-lg border border-gray-200 p-3">
                                    {uploadQueue.map((file, index) => (
                                        <div key={index}
                                             className="flex items-center gap-3 p-2 bg-gray-50 rounded-md text-sm">
                                            <div className="flex-shrink-0">
                                                <Icon name="file" className="h-5 w-5 text-gray-500"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromQueue(index)}
                                                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                                                disabled={uploading}
                                            >
                                                <Icon name="close" className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {uploadQueue.length > 0 && (
                        <div
                            className="flex items-center justify-end gap-x-3 p-5 border-t border-solid border-gray-200 rounded-b">
                            <button
                                onClick={() => setUploadQueue([])}
                                disabled={uploading}
                                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Clear Queue
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : `Upload ${uploadQueue.length} File(s)`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
