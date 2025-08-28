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
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Icon name="upload" className="w-5 h-5" />
                        <span>Upload</span>
                    </button>

                    {selectedFiles.size > 0 && (
                        <button
                            onClick={deleteSelectedFiles}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
                        >
                            <Icon name="trash" className="w-5 h-5" />
                            <span>Delete ({selectedFiles.size})</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <select
                        value={filters.type || ''}
                        onChange={(e) => setFilters({ type: e.target.value as any || undefined })}
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
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
                        onChange={(e) => setFilters({ sort: e.target.value as any })}
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                    >
                        <option value="-date">Newest First</option>
                        <option value="date">Oldest First</option>
                        <option value="size">Size (Small to Large)</option>
                        <option value="-size">Size (Large to Small)</option>
                    </select>

                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                            <Icon name="list" className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1 border-l border-gray-300 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                        >
                            <Icon name="grid" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search files..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ search: e.target.value || undefined })}
                    className="border border-gray-300 rounded px-3 py-1 w-64"
                />

                <div className="flex items-center space-x-2">
                    <button
                        onClick={selectedFiles.size === (files?.length || 0) ? clearSelection : selectAllFiles}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        {selectedFiles.size === (files?.length || 0) ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-sm text-gray-500">
            {selectedFiles.size > 0 && `${selectedFiles.size} selected`}
          </span>
                </div>
            </div>
        </div>
    );
};

const FileListView: React.FC = () => {
    const { files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection } = useShelfStore();

    return (
        <div className="bg-white">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600 uppercase tracking-wider">
                <div className="col-span-1"></div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Modified</div>
            </div>

            <div className="divide-y divide-gray-100">
                {files?.map((file) => (
                    <div
                        key={file.id}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                            selectedFile?.id === file.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        } ${selectedFiles.has(file.id) ? 'bg-blue-25' : ''}`}
                        onClick={() => setSelectedFile(file)}
                    >
                        <div className="col-span-1 flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedFiles.has(file.id)}
                                onChange={() => toggleFileSelection(file.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded"
                            />
                        </div>
                        <div className="col-span-5 flex items-center space-x-3">
                            <Icon name={file.type} className="w-5 h-5" />
                            <span className="truncate">{file.filename}</span>
                        </div>
                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                            {file.formatted_size}
                        </div>
                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                            {file.type.toUpperCase()}
                        </div>
                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                            {formatDate(file.updated_at)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FileGridView: React.FC = () => {
    const { files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection } = useShelfStore();

    return (
        <div className="p-4 grid grid-cols-6 gap-4">
            {files.map((file) => (
                <div
                    key={file.id}
                    className={`relative border rounded-lg p-3 hover:shadow-lg cursor-pointer transition-shadow ${
                        selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    } ${selectedFiles.has(file.id) ? 'bg-blue-25' : 'bg-white'}`}
                    onClick={() => setSelectedFile(file)}
                >
                    <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => toggleFileSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 left-2 rounded z-10"
                    />

                    <div className="flex flex-col items-center space-y-2">
                        {isImagePreviewable(file.mime_type) ? (
                            <img
                                src={`/storage/${file.path}`}
                                alt={file.filename}
                                className="w-16 h-16 object-cover rounded"
                            />
                        ) : (
                            <Icon name={file.type} className="text-gray-500 w-10 h-10" />
                        )}

                        <div className="text-center">
                            <p className="text-sm font-medium truncate w-full" title={file.filename}>
                                {file.filename}
                            </p>
                            <p className="text-xs text-gray-500">{file.formatted_size}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

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
        <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Metadata</h4>

            <div className="space-y-2">
                {file.metadata?.map((meta) => (
                    <div key={meta.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        {editingMeta === meta.id ? (
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={editValues.key}
                                    onChange={(e) => setEditValues({ ...editValues, key: e.target.value })}
                                    className="w-full text-xs border rounded px-2 py-1"
                                />
                                <input
                                    type="text"
                                    value={editValues.value}
                                    onChange={(e) => setEditValues({ ...editValues, value: e.target.value })}
                                    className="w-full text-xs border rounded px-2 py-1"
                                />
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleEditMetadata(meta.id)}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingMeta(null)}
                                        className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <div className="text-xs font-medium">{meta.key}</div>
                                    <div className="text-xs text-gray-600">{meta.value}</div>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => startEdit(meta)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        <Icon name="edit" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteMetadata(meta.id)}
                                        className="text-xs text-red-600 hover:text-red-800"
                                    >
                                        <Icon name="trash" className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-2 border-t pt-3">
                <input
                    type="text"
                    placeholder="Key"
                    value={newMeta.key}
                    onChange={(e) => setNewMeta({ ...newMeta, key: e.target.value })}
                    className="w-full text-xs border rounded px-2 py-1"
                />
                <input
                    type="text"
                    placeholder="Value"
                    value={newMeta.value}
                    onChange={(e) => setNewMeta({ ...newMeta, value: e.target.value })}
                    className="w-full text-xs border rounded px-2 py-1"
                />
                <button
                    onClick={handleAddMetadata}
                    className="w-full text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                >
                    Add Metadata
                </button>
            </div>
        </div>
    );
};

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
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
            <div className="text-center">
                {isImagePreviewable(selectedFile.mime_type) ? (
                    <div className="space-y-2">
                        <img
                            src={`/storage/${selectedFile.path}`}
                            alt={selectedFile.filename}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                            onClick={handleOpenFile}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            View Full Size
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <Icon name={selectedFile.type} className="text-gray-400 w-12 h-12" />
                        <button
                            onClick={handleOpenFile}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                            Open File
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h3 className="font-medium text-gray-900">{selectedFile.filename}</h3>

                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{selectedFile.formatted_size}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{selectedFile.type}</span>
                    </div>
                    {selectedFile.mime_type && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">MIME:</span>
                            <span className="text-xs">{selectedFile.mime_type}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{formatDate(selectedFile.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Modified:</span>
                        <span>{formatDate(selectedFile.updated_at)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t pt-4">
                <h4 className="font-medium text-gray-900">Actions</h4>
                <div className="space-y-2">
                    {replaceMode ? (
                        <div className="space-y-2">
                            <input
                                type="file"
                                onChange={handleFileReplace}
                                className="w-full text-xs"
                            />
                            <button
                                onClick={() => setReplaceMode(false)}
                                className="w-full text-xs bg-gray-600 text-white py-1 rounded hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setReplaceMode(true)}
                            className="w-full text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                        >
                            Replace File
                        </button>
                    )}

                    <button
                        onClick={() => deleteFile(selectedFile.id)}
                        className="w-full text-xs bg-red-600 text-white py-1 rounded hover:bg-red-700"
                    >
                        Delete File
                    </button>
                </div>
            </div>

            <div className="border-t pt-4">
                <MetadataEditor file={selectedFile} />
            </div>

            {selectedFile.fileables && selectedFile.fileables.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Attached To</h4>
                    <div className="space-y-1">
                        {selectedFile.fileables.map((fileable) => (
                            <a
                                key={`${fileable.type}-${fileable.fileable_id}-${fileable.role}`}
                                href={`#`}
                                className="block text-xs text-blue-600 hover:text-blue-800 p-1 bg-white rounded border"
                            >
                                {fileable.type} #{fileable.fileable_id} ({fileable.role})
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Upload Files</h3>
                    <button
                        onClick={() => setUploadModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <Icon name="close" className="w-6 h-6" />
                    </button>
                </div>

                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Icon name="upload" className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-2">Drag and drop files here</p>
                    <p className="text-sm text-gray-500 mb-4">or</p>
                    <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                        Choose Files
                        <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </label>
                </div>

                {uploadQueue.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Files to Upload ({uploadQueue.length})</h4>
                        <div className="space-y-1">
                            {uploadQueue.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                    <span className="truncate flex-1">{file.name}</span>
                                    <span className="text-xs text-gray-500 mr-2">{formatFileSize(file.size)}</span>
                                    <button
                                        onClick={() => removeFromQueue(index)}
                                        className="text-red-600 hover:text-red-800"
                                        disabled={uploading}
                                    >
                                        <Icon name="close" className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-2 mt-4">
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload All'}
                            </button>
                            <button
                                onClick={() => setUploadQueue([])}
                                disabled={uploading}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Pagination: React.FC = () => {
    const { pagination, filters, setFilters } = useShelfStore();

    const goToPage = (page: number) => {
        setFilters({ page });
    };

    if (pagination.last_page <= 1) return null;

    return (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
                Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total} results
            </div>

            <div className="flex space-x-1">
                <button
                    onClick={() => goToPage(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Previous
                </button>

                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 border rounded ${
                            page === pagination.current_page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => goToPage(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

const FileManager: React.FC = () => {
    const { loading, error, viewMode, fetchFiles } = useShelfStore();

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            <Toolbar />

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
                                {viewMode === 'list' ? <FileListView /> : <FileGridView />}
                            </div>
                            <Pagination />
                        </>
                    )}
                </div>

                <Sidebar />
            </div>

            <UploadModal />
        </div>
    );
};

export default FileManager;
