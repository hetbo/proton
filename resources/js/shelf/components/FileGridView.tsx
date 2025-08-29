import React from 'react';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";
import { isImagePreviewable } from '../utils/fileUtils';

const FileGridView: React.FC = () => {
    const { files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection } = useShelfStore();

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

                        <div className="p-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-800 truncate" title={file.filename}>
                                {file.filename}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{file.formatted_size}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileGridView;
