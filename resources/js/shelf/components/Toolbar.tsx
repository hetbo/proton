import React from 'react';
import { useShelfStore } from "../store/shelfStore";
import Icon from "../../icons/Icon";

const Toolbar: React.FC = () => {
    const {
        filters,
        setFilters,
        viewMode,
        setViewMode,
        selectedFiles,
        deleteSelectedFiles,
        clearSelection,
        setUploadModalOpen
    } = useShelfStore();

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
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

export default Toolbar;
