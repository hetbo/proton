import React, { useEffect } from 'react';
import { useShelfStore } from "../store/shelfStore";
import Toolbar from './Toolbar';
import FileListView from './FileListView';
import FileGridView from './FileGridView';
import Sidebar from './Sidebar';
import UploadModal from './UploadModal';
import Pagination from './Pagination';

const FileManager: React.FC = () => {
    const { loading, error, viewMode, fetchFiles } = useShelfStore();

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div className="h-screen flex flex-col bg-gray-50 font-sans">
            <Toolbar />

            <div className="flex-1 flex min-h-0">
                <div className="flex-1 flex flex-col bg-white">
                    {error && (
                        <div className="p-4">
                            <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading files...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                {viewMode === 'list' ? <FileListView /> : <FileGridView />}
                            </div>
                        )}
                    </div>

                    {!loading && <Pagination />}
                </div>

                <Sidebar />
            </div>

            <UploadModal />
        </div>
    );
};

export default FileManager;
