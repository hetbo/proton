import { ShelfFile, ApiResponse } from '../shelf/types/types';

interface DetachResponse {
    success: boolean;
    message?: string;
}

class FileShelf extends HTMLElement {
    private shadow: ShadowRoot;
    private files: ShelfFile[] = [];
    private isModalOpen: boolean = false;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    async connectedCallback() {
        this.renderLoading();
        const modelType = this.getAttribute('model-type');
        const modelId = this.getAttribute('model-id');
        const role = this.getAttribute('role');

        if (!modelType || !modelId || !role) {
            this.renderError('Error: model-type, model-id, and role are required attributes.');
            return;
        }

        try {
            this.files = await this.fetchFiles(modelType, modelId, role);
            this.render();
        } catch (error) {
            this.renderError(error instanceof Error ? error.message : 'An unknown error occurred.');
        }
    }

    private async fetchFiles(modelType: string, modelId: string, role: string): Promise<ShelfFile[]> {
        const params = new URLSearchParams({
            type: modelType,
            id: modelId,
            role: role,
        });
        const response = await fetch(`/fileables?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        const result: ApiResponse = await response.json();

        if (!result.success) {
            throw new Error('API returned an error.');
        }
        return result.data;
    }

    private async detachFile(fileId: number): Promise<void> {
        const modelType = this.getAttribute('model-type');
        const modelId = this.getAttribute('model-id');
        const role = this.getAttribute('role');

        if (!modelType || !modelId || !role) {
            throw new Error('Cannot detach file: component is missing required attributes.');
        }

        const response = await fetch('/fileables/detach', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model_type: modelType,
                model_id: modelId,
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

    private handleGridClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const deleteButton = target.closest('.delete-btn');

        if (deleteButton instanceof HTMLElement) {
            const fileId = parseInt(deleteButton.dataset.fileId || '0');
            if (fileId) {
                this.handleDelete(fileId);
            }
        }
    }

    private handleChooseMedia = () => {
        this.isModalOpen = true;
        this.render();
    }

    private handleCloseModal = () => {
        this.isModalOpen = false;
        this.render();
    }

    private async handleDelete(fileId: number) {
        const originalFiles = [...this.files];
        this.files = this.files.filter(f => f.id !== fileId);
        this.render();

        try {
            await this.detachFile(fileId);
        } catch (error) {
            console.error('Failed to detach file:', error);
            this.files = originalFiles;
            this.render();
            alert('Could not remove the file. Please try again.');
        }
    }

    private getStyles(): string {
        return `
            .shelf-container { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
            .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
            .grid-item { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; background-color: #f8fafc; }
            .thumbnail { width: 100%; height: 90px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; background-color: #f1f5f9; border-radius: 0.25rem; overflow: hidden; }
            .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
            .icon { font-size: 2.5rem; }
            .filename { font-family: sans-serif; font-size: 0.8rem; color: #334155; word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            .delete-btn { position: absolute; top: -0.5rem; right: -0.5rem; display: flex; align-items: center; justify-content: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; border: none; background-color: #ef4444; color: white; cursor: pointer; font-size: 1rem; line-height: 1; transition: transform 0.1s ease-in-out; z-index: 10; }
            .delete-btn:hover { background-color: #dc2626; transform: scale(1.1); }
            .choose-media-btn { padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background-color: #f9fafb; font-weight: 600; cursor: pointer; }
            .choose-media-btn:hover { background-color: #f3f4f6; }
            .hidden { display: none !important; }
            .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
            .modal-content { position: relative; background-color: white; padding: 2rem; border-radius: 0.5rem; width: 90%; max-width: 800px; height: 80vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
            .modal-close-btn { position: absolute; top: 0.75rem; right: 0.75rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af; }
            .modal-close-btn:hover { color: #111827; }
        `;
    }

    private render() {
        this.shadow.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="shelf-container">
                <div class="grid-container">
                    ${this.files.length > 0
            ? this.files.map(file => `
                            <div class="grid-item">
                                <button class="delete-btn" data-file-id="${file.id}">&times;</button>
                                <div class="thumbnail">
                                    ${file.type === 'image'
                ? `<img src="/storage/${file.path}" alt="${file.filename}" loading="lazy">`
                : `<span class="icon">${this.getFileIcon(file.type)}</span>`
            }
                                </div>
                                <span class="filename">${file.filename}</span>
                            </div>
                        `).join('')
            : `<p>No files attached. Click "Choose Media" to add some.</p>`
        }
                </div>
                <button id="choose-media-btn" class="choose-media-btn">Choose Media</button>
            </div>
            <div class="modal-overlay ${this.isModalOpen ? '' : 'hidden'}">
                <div class="modal-content">
                    <button id="modal-close-btn" class="modal-close-btn">&times;</button>
                    <p>I am an empty modal.</p>
                </div>
            </div>
        `;
        this.attachEventListeners();
    }

    private attachEventListeners() {
        this.shadow.querySelector('.grid-container')?.addEventListener('click', this.handleGridClick);
        this.shadow.querySelector('#choose-media-btn')?.addEventListener('click', this.handleChooseMedia);
        this.shadow.querySelector('#modal-close-btn')?.addEventListener('click', this.handleCloseModal);
    }

    private renderLoading() {
        this.shadow.innerHTML = `<p>Loading files...</p>`;
    }

    private renderError(message: string) {
        this.shadow.innerHTML = `<p style="color: red;">${message}</p>`;
    }

    private getFileIcon(type: ShelfFile['type']): string {
        switch (type) {
            case 'image': return '🖼️';
            case 'video': return '🎬';
            case 'audio': return '🎵';
            case 'document': return '📄';
            case 'archive': return '📦';
            default: return '❔';
        }
    }
}

customElements.define('file-shelf', FileShelf);
