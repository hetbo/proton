import { ShelfFile, Metadata, PaginatedResponse, FilterOptions, ApiResponse } from '../types/types';

const API_BASE = '';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    async getFiles(filters: FilterOptions = {}): Promise<PaginatedResponse<ShelfFile>> {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
            }
        });

        return this.request<PaginatedResponse<ShelfFile>>(`/files?${params}`);
    }

    async uploadFile(file: File): Promise<ApiResponse<ShelfFile>> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/files/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload Error: ${response.status}`);
        }

        return response.json();
    }

    async deleteFile(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>('/files/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }

    async replaceFile(id: number, file: File): Promise<ApiResponse> {
        const formData = new FormData();
        formData.append('id', String(id));
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/files/replace`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Replace Error: ${response.status}`);
        }

        return response.json();
    }

    async addMetadata(fileId: number, key: string, value: string): Promise<ApiResponse<Metadata>> {
        return this.request<ApiResponse<Metadata>>('/meta/add', {
            method: 'POST',
            body: JSON.stringify({ file_id: fileId, key, value }),
        });
    }

    async updateMetadata(id: number, key: string, value: string): Promise<ApiResponse<Metadata>> {
        return this.request<ApiResponse<Metadata>>('/meta/update', {
            method: 'PATCH',
            body: JSON.stringify({ id, key, value }),
        });
    }

    async deleteMetadata(id: number): Promise<ApiResponse> {
        return this.request<ApiResponse>('/meta/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
}

export const api = new ApiClient();
