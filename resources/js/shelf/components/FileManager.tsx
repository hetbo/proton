import React, { useEffect, useState } from 'react';
import { ShelfFile } from '../types/types';
import {useShelfStore} from "../store/shelfStore";
import Icon from "../../icons/Icon";

/*
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
    <i className={`icon-${name} ${className}`} />
);
*/

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType === 'application/pdf') return 'file-pdf';
    if (mimeType.includes('word')) return 'file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'file';
};

const isImagePreviewable = (mimeType: string | undefined): boolean => {
    if (!mimeType)
        return false;
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType);
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <Icon name="folder" className="text-6xl mb-4" />
        <p className="text-lg font-medium">No files found</p>
        <p className="text-sm">Upload some files to get started</p>
    </div>
);

const Toolbar: React.FC = () => {
    const {
        filters,
        setFilters,
        viewMode,
        setViewMode,
        selectedFiles,
        deleteSelectedFiles,
        selectAllFiles,
        clearSelection,
        setUploadModalOpen,
        files
    } = useShelfStore();

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
                {/* Left Side: Primary & Contextual Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="inline-flex items-center gap-2 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <Icon name="upload" className="w-5 h-5"/>
                        <span>Upload</span>
                    </button>

                    {selectedFiles.size > 0 && (
                        <>
                            <div className="h-6 w-px bg-gray-200" aria-hidden="true"></div>
                            <span className="text-sm font-medium text-gray-700">
                        {selectedFiles.size} selected
                    </span>
                            <button
                                onClick={deleteSelectedFiles}
                                className="inline-flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-100"
                            >
                                <Icon name="trash" className="w-5 h-5"/>
                                <span>Delete</span>
                            </button>
                            <button
                                onClick={clearSelection}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Deselect All
                            </button>
                        </>
                    )}
                </div>

                {/* Right Side: Search, Filter & View Controls */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Icon name="search" className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={filters.search || ''}
                            onChange={(e) => setFilters({search: e.target.value || undefined})}
                            className="block w-64 rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                        />
                    </div>

                    <select
                        value={filters.type || ''}
                        onChange={(e) => setFilters({type: e.target.value as any || undefined})}
                        className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    >
                        <option value="">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="audio">Audio</option>
                        <option value="document">Documents</option>
                        <option value="archive">Archives</option>
                    </select>

                    <select
                        value={filters.sort || '-date'}
                        onChange={(e) => setFilters({sort: e.target.value as any})}
                        className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    >
                        <option value="-date">Newest First</option>
                        <option value="date">Oldest First</option>
                        <option value="size">Size (Asc)</option>
                        <option value="-size">Size (Desc)</option>
                    </select>

                    <div className="flex items-center rounded-md shadow-sm ring-1 ring-inset ring-gray-300">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-semibold ${
                                viewMode === 'list' ? 'z-10 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Icon name="list" className="w-5 h-5"/>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-2 text-sm font-semibold ${
                                viewMode === 'grid' ? 'z-10 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Icon name="grid" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FileListView: React.FC = () => {
    const {files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection} = useShelfStore();

    return (
        <div className="bg-white font-sans">
            {/* Header */}
            <div
                className="grid grid-cols-12 gap-x-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">
                    {/* Optional: Add a master checkbox for select-all functionality */}
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-right">Last Modified</div>
            </div>

            {/* File List */}
            <div className="divide-y divide-gray-100">
                {files?.map((file) => (
                    <div
                        key={file.id}
                        className={`grid grid-cols-12 gap-x-4 px-6 py-3 transition-colors duration-150 ease-in-out cursor-pointer group ${
                            selectedFile?.id === file.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } ${selectedFiles.has(file.id) ? 'bg-indigo-50 hover:bg-indigo-100' : ''}`}
                        onClick={() => setSelectedFile(file)}
                    >
                        {/* Checkbox and Selection Indicator */}
                        <div className="col-span-1 flex items-center">
                            <div
                                className={`absolute left-0 w-1 h-full rounded-r-full transition-colors duration-150 ease-in-out ${selectedFile?.id === file.id ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <input
                                type="checkbox"
                                checked={selectedFiles.has(file.id)}
                                onChange={() => toggleFileSelection(file.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Filename and Icon */}
                        <div className="col-span-5 flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <Icon name={file.type} className="w-6 h-6 text-gray-500"/>
                            </div>
                            <span className="text-sm font-medium text-gray-800 truncate">{file.filename}</span>
                        </div>

                        {/* Size */}
                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                            {file.formatted_size}
                        </div>

                        {/* Type */}
                        <div className="col-span-2 flex items-center">
                    <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {file.type.toUpperCase()}
                    </span>
                        </div>

                        {/* Modified Date */}
                        <div className="col-span-2 flex items-center justify-end text-sm text-gray-600">
                            {formatDate(file.updated_at)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FileGridView: React.FC = () => {
    const {files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection} = useShelfStore();

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {files?.map((file) => (
                    <div
                        key={file.id}
                        className={`relative group rounded-lg overflow-hidden border transition-all duration-150 ease-in-out cursor-pointer
                    ${selectedFile?.id === file.id ? 'border-indigo-400 ring-2 ring-indigo-300' : 'border-gray-200 hover:shadow-md hover:border-gray-300'}
                    ${selectedFiles.has(file.id) ? 'bg-indigo-50' : 'bg-white'}`}
                        onClick={() => setSelectedFile(file)}
                    >
                        {/* Selection Checkbox & Overlay */}
                        <div
                            className="absolute top-2 right-2 z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleFileSelection(file.id);
                            }}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors
                        ${selectedFiles.has(file.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white/50 border-gray-400 group-hover:border-gray-600'}`}
                            >
                                {selectedFiles.has(file.id) && (
                                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                )}
                            </div>
                        </div>

                        {/* File Preview/Icon */}
                        <div
                            className="aspect-square w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                            {isImagePreviewable(file.mime_type) ? (
                                <img
                                    src={`/storage/${file.path}`}
                                    alt={file.filename}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Icon name={file.type} className="w-12 h-12 text-gray-400"/>
                            )}
                        </div>

                        {/* File Information */}
                        <div className="p-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-800 truncate" title={file.filename}>
                                {file.filename}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{file.formatted_size}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>);
};

const MetadataEditor: React.FC<{ file: ShelfFile }> = ({file}) => {
    const {addMetadata, updateMetadata, deleteMetadata} = useShelfStore();
    const [editingMeta, setEditingMeta] = useState<number | null>(null);
    const [newMeta, setNewMeta] = useState({key: '', value: ''});
    const [editValues, setEditValues] = useState({key: '', value: ''});

    const handleAddMetadata = async () => {
        if (newMeta.key && newMeta.value) {
            await addMetadata(file.id, newMeta.key, newMeta.value);
            setNewMeta({key: '', value: ''});
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
        setEditValues({key: meta.key, value: meta.value});
    };

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Metadata</h4>

            {/* Metadata List */}
            <div className="space-y-2">
                {file.metadata?.map((meta) => (
                    <div key={meta.id} className="group flex items-center justify-between p-2.5 bg-gray-50 rounded-md">
                        {editingMeta === meta.id ? (
                            // Editing State
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        value={editValues.key}
                                        onChange={(e) => setEditValues({...editValues, key: e.target.value})}
                                        className="block w-full rounded-md border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
                                    />
                                    <input
                                        type="text"
                                        value={editValues.value}
                                        onChange={(e) => setEditValues({...editValues, value: e.target.value})}
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
                            // Display State
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
                                        <Icon name="edit" className="w-4 h-4"/>
                                    </button>
                                    <button
                                        onClick={() => deleteMetadata(meta.id)}
                                        className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600"
                                    >
                                        <Icon name="trash" className="w-4 h-4"/>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Metadata Form */}
            <div className="space-y-2 border-t border-gray-200/75 pt-4">
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        placeholder="Key"
                        value={newMeta.key}
                        onChange={(e) => setNewMeta({...newMeta, key: e.target.value})}
                        className="block w-full rounded-md border-0 py-1.5 px-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        value={newMeta.value}
                        onChange={(e) => setNewMeta({...newMeta, value: e.target.value})}
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
        </div>);
};

const Sidebar: React.FC = () => {
    const {selectedFile, deleteFile, replaceFile} = useShelfStore();
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
                {/* File Preview */}
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

                {/* File Details */}
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

                {/* Metadata Section */}
                <div>
                    <MetadataEditor file={selectedFile}/>
                </div>

                {/* Attached To Section */}
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

            {/* Actions Footer */}
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
        </div>);
};

const UploadModal: React.FC = () => {
    const {uploadModalOpen, setUploadModalOpen, uploadFile} = useShelfStore();
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
                    {/* Modal Header */}
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

                    {/* Modal Body */}
                    <div className="relative p-6 flex-auto">
                        {uploadQueue.length === 0 ? (
                            // Dropzone View
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
                            // File Queue View
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

                    {/* Modal Footer */}
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

const Pagination: React.FC = () => {
    const {pagination, filters, setFilters} = useShelfStore();

    const goToPage = (page: number) => {
        setFilters({page});
    };

    if (pagination.last_page <= 1) return null;

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
            {/* Left Side: Pagination Info */}
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => goToPage(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => goToPage(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Right Side: Pagination Controls (Hidden on small screens) */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{pagination.from || 0}</span> to <span
                        className="font-medium">{pagination.to || 0}</span> of{' '}
                        <span className="font-medium">{pagination.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => goToPage(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            {/* Heroicon name: chevron-left */}
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                 fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>

                        {/* Page numbers would be dynamically rendered here, this is a static example */}
                        {Array.from({length: pagination.last_page}, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => goToPage(page)}
                                aria-current={page === pagination.current_page ? 'page' : undefined}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.current_page
                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => goToPage(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            {/* Heroicon name: chevron-right */}
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                 fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd"
                                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>);
};

const FileManager: React.FC = () => {
    const {loading, error, viewMode, fetchFiles} = useShelfStore();

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <Toolbar/>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-gray-500">Loading...</div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto">
                                {viewMode === 'list' ? <FileListView/> : <FileGridView/>}
                            </div>
                            <Pagination/>
                        </>
                    )}
                </div>

                <Sidebar/>
            </div>

            <UploadModal/>
        </div>
    );
};

export default FileManager;
