import { create } from 'zustand';
import { ShelfFile, FilterOptions, PaginatedResponse, ViewMode } from '../types/types';
import { api } from '../services/api';

interface ShelfState {
    files: ShelfFile[];
    selectedFile: ShelfFile | null;
    selectedFiles: Set<number>;
    loading: boolean;
    error: string | null;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: FilterOptions;
    viewMode: ViewMode;
    uploadModalOpen: boolean;

    setSelectedFile: (file: ShelfFile | null) => void;
    toggleFileSelection: (fileId: number) => void;
    selectAllFiles: () => void;
    clearSelection: () => void;
    setFilters: (filters: Partial<FilterOptions>) => void;
    setViewMode: (mode: ViewMode) => void;
    setUploadModalOpen: (open: boolean) => void;

    fetchFiles: () => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    deleteFile: (id: number) => Promise<void>;
    deleteSelectedFiles: () => Promise<void>;
    replaceFile: (id: number, file: File) => Promise<void>;

    addMetadata: (fileId: number, key: string, value: string) => Promise<void>;
    updateMetadata: (id: number, key: string, value: string) => Promise<void>;
    deleteMetadata: (id: number) => Promise<void>;
}

export const useShelfStore = create<ShelfState>((set, get) => ({
    files: [],
    selectedFile: null,
    selectedFiles: new Set(),
    loading: false,
    error: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
    },
    filters: {},
    viewMode: 'list',
    uploadModalOpen: false,

    setSelectedFile: (file) => set({ selectedFile: file }),

    toggleFileSelection: (fileId) => {
        const { selectedFiles } = get();
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(fileId)) {
            newSelection.delete(fileId);
        } else {
            newSelection.add(fileId);
        }
        set({ selectedFiles: newSelection });
    },

    selectAllFiles: () => {
        const { files } = get();
        set({ selectedFiles: new Set(files.map(f => f.id)) });
    },

    clearSelection: () => set({ selectedFiles: new Set() }),

    setFilters: (newFilters) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };

        // Don't reset page to 1 if we're explicitly setting a page
        if (!newFilters.hasOwnProperty('page')) {
            updatedFilters.page = 1;
        }

        set({ filters: updatedFilters });
        get().fetchFiles();
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setUploadModalOpen: (open) => set({ uploadModalOpen: open }),

    fetchFiles: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.getFiles(get().filters);
            set({
                files: response.data,
                pagination: {
                    current_page: response.current_page,
                    last_page: response.last_page,
                    per_page: response.per_page,
                    total: response.total,
                    from: response.from,
                    to: response.to,
                },
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch files' });
        } finally {
            set({ loading: false });
        }
    },

    uploadFile: async (file) => {
        set({ loading: true, error: null });
        try {
            await api.uploadFile(file);
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to upload file' });
        } finally {
            set({ loading: false });
        }
    },

    deleteFile: async (id) => {
        set({ loading: true, error: null });
        try {
            await api.deleteFile(id);
            const { selectedFile } = get();
            if (selectedFile?.id === id) {
                set({ selectedFile: null });
            }
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
        } finally {
            set({ loading: false });
        }
    },

    deleteSelectedFiles: async () => {
        const { selectedFiles, selectedFile } = get();
        if (selectedFiles.size === 0) return;

        set({ loading: true, error: null });
        try {
            await Promise.all(
                Array.from(selectedFiles).map(id => api.deleteFile(id))
            );

            if (selectedFile && selectedFiles.has(selectedFile.id)) {
                set({ selectedFile: null });
            }

            set({ selectedFiles: new Set() });
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete files' });
        } finally {
            set({ loading: false });
        }
    },

    replaceFile: async (id, file) => {
        set({ loading: true, error: null });
        try {
            await api.replaceFile(id, file);
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to replace file' });
        } finally {
            set({ loading: false });
        }
    },

    addMetadata: async (fileId, key, value) => {
        try {
            await api.addMetadata(fileId, key, value);
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to add metadata' });
        }
    },

    updateMetadata: async (id, key, value) => {
        try {
            await api.updateMetadata(id, key, value);
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update metadata' });
        }
    },

    deleteMetadata: async (id) => {
        try {
            await api.deleteMetadata(id);
            await get().fetchFiles();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete metadata' });
        }
    },
}));
