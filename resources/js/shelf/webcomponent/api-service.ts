import { ApiResponse, ShelfFile, PaginatedFilesResponse, AttachResponse, DetachResponse } from '../types/types';

export class ApiService {
    static async fetchFiles(modelType: string, modelId: string, role: string): Promise<ShelfFile[]> {
        const params = new URLSearchParams({
            type: modelType,
            id: modelId,
            role: role,
        });
        const response = await fetch(`/fileables?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result: ApiResponse<ShelfFile[]> = await response.json();

        if (!result.success) {
            throw new Error('API returned an error.');
        }
        return result.data || [];
    }

    static async attachFile(modelType: string, modelId: string, role: string, fileId: number): Promise<void> {
        const response = await fetch('/fileables/attach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: modelType,
                id: modelId,
                role: role,
                file_id: fileId,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result: AttachResponse = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'API returned an error while attaching the file.');
        }
    }

    static async detachFile(modelType: string, modelId: string, role: string, fileId: number): Promise<void> {
        const response = await fetch('/fileables/detach', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: modelType,
                id: modelId,
                role: role,
                file_id: fileId,
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result: DetachResponse = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'API returned an error while detaching the file.');
        }
    }

    static async fetchModalData(url: string = '/files'): Promise<PaginatedFilesResponse> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
    }
}
