import React from 'react';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";
import { formatDate } from '../utils/fileUtils';

const FileListView: React.FC = () => {
    const { files, selectedFiles, selectedFile, setSelectedFile, toggleFileSelection } = useShelfStore();

    return (
        <div className="bg-white font-sans">
            <div
                className="grid grid-cols-12 gap-x-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-1 flex items-center">
                </div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2 text-right">Last Modified</div>
            </div>

            <div className="divide-y divide-gray-100">
                {files?.map((file) => (
                    <div
                        key={file.id}
                        className={`relative grid grid-cols-12 gap-x-4 px-6 py-3 transition-colors duration-150 ease-in-out cursor-pointer group ${
                            selectedFile?.id === file.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                        } ${selectedFiles.has(file.id) ? 'bg-indigo-50 hover:bg-indigo-100' : ''}`}
                        onClick={() => setSelectedFile(file)}
                    >
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

                        <div className="col-span-5 flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <Icon name={file.type} className="w-6 h-6 text-gray-500"/>
                            </div>
                            <span className="text-sm font-medium text-gray-800 truncate">{file.filename}</span>
                        </div>

                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                            {file.formatted_size}
                        </div>

                        <div className="col-span-2 flex items-center">
                            <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {file.type.toUpperCase()}
                            </span>
                        </div>

                        <div className="col-span-2 flex items-center justify-end text-sm text-gray-600">
                            {formatDate(file.updated_at)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileListView;
