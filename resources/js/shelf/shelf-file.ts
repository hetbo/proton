import {ApiResponse, ShelfFile, PaginatedFilesResponse, AttachResponse} from './types/types';

interface DetachResponse {
    success: boolean;
    message?: string;
}

class FileShelf extends HTMLElement {
    private shadow: ShadowRoot;
    private files: ShelfFile[] = [];
    private isModalOpen: boolean = false;
    private modalContent: string = '<p>I am an empty modal.</p>';

    private modalData: PaginatedFilesResponse | null = null;
    private isModalLoading: boolean = false;
    private modalError: string | null = null;

    private attachedFileIds: Set<number> = new Set();

    private modalFilters = {
        search: '',
        sort: '-date',
        type: '',
        year: '',
        month: ''
    };

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

    private async fetchAndRenderModalData() {
        this.isModalLoading = true;
        this.modalError = null;
        this.render();

        const params = new URLSearchParams();
        if (this.modalFilters.search) {
            params.set('search', this.modalFilters.search);
        }
        if (this.modalFilters.sort) {
            params.set('sort', this.modalFilters.sort);
        }
        if (this.modalFilters.type) {
            params.set('type', this.modalFilters.type);
        }

        const url = `/files?${params.toString()}`;

        try {
            this.modalData = await this.fetchModalData(url);
        } catch (error) {
            this.modalError = error instanceof Error ? error.message : 'Could not load media.';
        } finally {
            this.isModalLoading = false;
            this.render();
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

    private async attachFile(fileId: number): Promise<void> {
        const modelType = this.getAttribute('model-type');
        const modelId = this.getAttribute('model-id');
        const role = this.getAttribute('role');

        if (!modelType || !modelId || !role) {
            throw new Error('Cannot attach file: component is missing required attributes.');
        }

        const response = await fetch('/fileables/attach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // CORRECTED KEYS:
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
                // CORRECTED KEYS:
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

    private async fetchModalData(url: string = '/files'): Promise<PaginatedFilesResponse> {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
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
        this.attachedFileIds = new Set(this.files.map(f => f.id));

        this.modalFilters = { search: '', sort: '-date', type: '', year: '', month: '' };

        this.fetchAndRenderModalData();
    }

    private handleCloseModal = () => {
        this.isModalOpen = false;
        this.modalData = null;
        this.modalError = null;
        this.render();
    }

    private async handleDelete(fileId: number) {
        const originalFiles = [...this.files];

        // --- Optimistic Update ---
        this.files = this.files.filter(f => f.id !== fileId);
        this.attachedFileIds.delete(fileId);
        this.render();

        try {
            await this.detachFile(fileId);
        } catch (error) {
            console.error('Failed to detach file:', error);
            this.files = originalFiles;
            this.attachedFileIds.add(fileId);
            this.render();

            alert(error instanceof Error ? error.message : 'Could not remove the file. Please try again.');
        }
    }

    private handleModalClick = (event: Event) => {
        const target = event.target as HTMLElement;
        const paginationLink = target.closest('.pagination-link');
        const attachButton = target.closest('.attach-btn');
        const detachButton = target.closest('.detach-btn');

        if (paginationLink) {
            event.preventDefault();
            const url = paginationLink.getAttribute('data-url');
            if (url && !paginationLink.classList.contains('disabled')) {
                this.handlePaginationClick(url);
            }
        }

        if (attachButton instanceof HTMLElement) {
            const fileId = parseInt(attachButton.dataset.fileId || '0');
            if (fileId) {
                this.handleAttach(fileId);
            }
            return;
        }

        if (detachButton instanceof HTMLElement) {
            const fileId = parseInt(detachButton.dataset.fileId || '0');
            if (fileId) {
                this.handleDelete(fileId);
            }
            return;
        }
    }

    private async handleAttach(fileId: number) {

        const fileToAttach = this.modalData?.data.find(f => f.id === fileId);
        if (!fileToAttach) {
            console.error('File to attach not found in modal data.');
            return;
        }

        this.files.push(fileToAttach);
        this.attachedFileIds.add(fileId);
        this.render();

        try {

            await this.attachFile(fileId);
        } catch (error) {
            console.error('Failed to attach file:', error);
            this.files = this.files.filter(f => f.id !== fileId);
            this.attachedFileIds.delete(fileId);
            this.render();

            alert(error instanceof Error ? error.message : 'Could not attach the file. Please try again.');
        }
    }


    private handlePaginationClick = async (url: string) => {
        this.isModalLoading = true;
        this.modalError = null;
        this.render();

        try {
            this.modalData = await this.fetchModalData(url);
        } catch (error) {
            this.modalError = error instanceof Error ? error.message : 'Could not load page.';
        } finally {
            this.isModalLoading = false;
            this.render();
        }
    }


    private getStyles(): string {
        return `
            /* Tailwind-equivalent styles compiled for Shadow DOM */
            .shelf-container {
                padding: 1rem;
                border: 1px solid #e2e8f0;
                border-radius: 0.5rem;
                background-color: #ffffff;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            .grid-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
            }
            .grid-item {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 0.5rem;
                border: 1px solid #cbd5e1;
                border-radius: 0.375rem;
                background-color: #f8fafc;
                transition: background-color 0.15s ease-in-out;
            }
            .grid-item:hover {
                background-color: #f1f5f9;
            }
            .thumbnail {
                width: 100%;
                height: 90px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 0.5rem;
                background-color: #f1f5f9;
                border-radius: 0.25rem;
                overflow: hidden;
            }
            .thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .icon {
                font-size: 2.5rem;
            }
            .filename {
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                font-size: 0.75rem;
                color: #475569;
                word-break: break-all;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            .delete-btn {
                position: absolute;
                top: -0.5rem;
                right: -0.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 50%;
                border: none;
                background-color: #ef4444;
                color: white;
                cursor: pointer;
                font-size: 1rem;
                line-height: 1;
                transition: all 0.15s ease-in-out;
                z-index: 10;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .delete-btn:hover {
                background-color: #dc2626;
                transform: scale(1.1);
            }
            .choose-media-btn {
                display: inline-flex;
                align-items: center;
                padding: 0.5rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                background-color: #ffffff;
                font-weight: 500;
                font-size: 0.875rem;
                color: #374151;
                cursor: pointer;
                transition: all 0.15s ease-in-out;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            }
            .choose-media-btn:hover {
                background-color: #f9fafb;
                border-color: #9ca3af;
            }
            .choose-media-btn:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            .empty-state {
                grid-column: 1 / -1;
                text-align: center;
                padding: 2rem 1rem;
                color: #64748b;
            }
            .empty-state p {
                margin: 0;
                font-size: 0.875rem;
            }
            .hidden {
                display: none !important;
            }
            .modal-overlay {
                position: fixed;
                inset: 0;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                position: relative;
                background-color: white;
                padding: 2rem;
                border-radius: 0.5rem;
                width: 90%;
                max-width: 800px;
                height: 80vh;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .modal-close-btn {
                position: absolute;
                top: 0.75rem;
                right: 0.75rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #9ca3af;
                transition: color 0.15s ease-in-out;
            }
            .modal-close-btn:hover {
                color: #111827;
            }
            .loading, .error {
                padding: 1rem;
                border-radius: 0.5rem;
            }
            .loading {
                border: 1px solid #e2e8f0;
                background-color: #ffffff;
            }
            .error {
                color: #dc2626;
                background-color: #fef2f2;
                border: 1px solid #fecaca;
            }
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
            : `<div class="empty-state">
                    <p>No files attached. Click "Choose Media" to add some.</p>
                </div>`
        }
                </div>
                <button id="choose-media-btn" class="choose-media-btn">Choose Media</button>
            </div>
            <div class="modal-overlay ${this.isModalOpen ? '' : 'hidden'}">
                <div class="modal-content">
                    <button id="modal-close-btn" class="modal-close-btn">&times;</button>
                    <div id="modal-body">${this.renderModalBody()}</div>
                </div>
            </div>
                    `;
        this.attachEventListeners();
    }

    private renderModalBody(): string {
        if (this.isModalLoading) {
            return `<p>Loading media...</p>`;
        }

        if (this.modalError) {
            return `<p class="error">${this.modalError}</p>`;
        }

        const filtersHtml = `
        <form id="modal-filters-form" class="modal-filters">
            <div class="filter-group">
                <input type="search" id="modal-search-input" placeholder="Search by filename..." value="${this.modalFilters.search}">
                <button type="submit">Search</button>
            </div>
            <div class="filter-group">
                <select id="modal-type-select">
                    <option value="">All Types</option>
                    <option value="image" ${this.modalFilters.type === 'image' ? 'selected' : ''}>Images</option>
                    <option value="video" ${this.modalFilters.type === 'video' ? 'selected' : ''}>Videos</option>
                    <option value="audio" ${this.modalFilters.type === 'audio' ? 'selected' : ''}>Audio</option>
                    <option value="document" ${this.modalFilters.type === 'document' ? 'selected' : ''}>Documents</option>
                    <option value="archive" ${this.modalFilters.type === 'archive' ? 'selected' : ''}>Archives</option>
                </select>
                <select id="modal-sort-select">
                    <option value="-date" ${this.modalFilters.sort === '-date' ? 'selected' : ''}>Newest First</option>
                    <option value="date" ${this.modalFilters.sort === 'date' ? 'selected' : ''}>Oldest First</option>
                    <option value="-size" ${this.modalFilters.sort === '-size' ? 'selected' : ''}>Size (Largest)</option>
                    <option value="size" ${this.modalFilters.sort === 'size' ? 'selected' : ''}>Size (Smallest)</option>
                </select>
            </div>
        </form>
    `;

        if (this.modalData && this.modalData.data.length > 0) {
            const filesHtml = this.modalData.data.map(file => {
                const isAttached = this.attachedFileIds.has(file.id);

                const buttonHtml = isAttached
                    ? `<button class="detach-btn" data-file-id="${file.id}">Detach</button>`
                    : `<button class="attach-btn" data-file-id="${file.id}">Attach</button>`;

                return `
                    <div class="grid-item">
                        <div class="thumbnail">
                            ${file.type.startsWith('image')
                    ? `<img src="/storage/${file.path}" alt="${file.filename}" loading="lazy">`
                    : `<span class="icon">${this.getFileIcon(file.type as any)}</span>`
                }
                        </div>
                        <span class="filename">${file.filename}</span>
                        ${buttonHtml}
                    </div>
                `;
            }).join('');

            const paginationHtml = `
                <div class="pagination">
                    ${this.modalData.links.map(link => `
                        <a href="#"
                           class="pagination-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}"
                           data-url="${link.url || ''}">
                           ${link.label.replace(/&laquo;|&raquo;/g, '').trim()}
                        </a>
                    `).join('')}
                </div>`;

            return `${filtersHtml}<div class="grid-container">${filesHtml}</div>${paginationHtml}`;
        }

        return `${filtersHtml}<p>No media found.</p>`;
    }

    private attachEventListeners() {
        this.shadow.querySelector('.grid-container')?.addEventListener('click', this.handleGridClick);
        this.shadow.querySelector('#choose-media-btn')?.addEventListener('click', this.handleChooseMedia);
        this.shadow.querySelector('#modal-close-btn')?.addEventListener('click', this.handleCloseModal);
        this.shadow.querySelector('.modal-content')?.addEventListener('click', this.handleModalClick);

        this.shadow.querySelector('#modal-filters-form')?.addEventListener('submit', this.handleFilterSubmit);
    }

    private handleFilterChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;

        if (target.id === 'modal-type-select') {
            this.modalFilters.type = target.value;
        }
        if (target.id === 'modal-sort-select') {
            this.modalFilters.sort = target.value;
        }
        this.fetchAndRenderModalData();
    }

    private handleFilterSubmit = (event: Event) => {
        event.preventDefault();
        const searchInput = this.shadow.querySelector('#modal-search-input') as HTMLInputElement;
        if (searchInput) {
            this.modalFilters.search = searchInput.value;
        }
        this.fetchAndRenderModalData();
    }


    private renderLoading() {
        this.shadow.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="loading">
                <p>Loading files...</p>
            </div>
        `;
    }

    private renderError(message: string) {
        this.shadow.innerHTML = `
            <style>${this.getStyles()}</style>
            <div class="error">
                <p>${message}</p>
            </div>
        `;
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



    private renderModalContent(data: any) {

        this.modalContent = `
        <h2>Choose Media</h2>

        ${data.data[0].id}

    `;
        this.render();
    }

    private renderModalError(message: string) {
        this.modalContent = `<p class="error">${message}</p>`;
        this.render();
    }


}

customElements.define('file-shelf', FileShelf);
