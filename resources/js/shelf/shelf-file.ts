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
        * {
            box-sizing: border-box;
        }

        /* Minimal container */
        .shelf-container {
            padding: 1rem;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            position: relative;
        }

        /* Tight grid */
        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        /* Clean card design */
        .grid-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0.75rem 0.5rem;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
        }

        .grid-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            border-color: #6366f1;
        }

        /* Compact thumbnail */
        .thumbnail {
            width: 100%;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
            background: #f8fafc;
            border-radius: 0.25rem;
            overflow: hidden;
        }

        .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.2s ease;
        }

        .grid-item:hover .thumbnail img {
            transform: scale(1.02);
        }

        /* Smaller icons */
        .icon {
            font-size: 2rem;
            opacity: 0.7;
            transition: opacity 0.2s ease;
        }

        .grid-item:hover .icon {
            opacity: 0.9;
        }

        /* Compact typography */
        .filename {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 0.75rem;
            font-weight: 500;
            color: #475569;
            word-break: break-word;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.3;
        }

        /* Minimal delete button */
        .delete-btn {
            position: absolute;
            top: -0.25rem;
            right: -0.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.25rem;
            height: 1.25rem;
            border-radius: 50%;
            border: 1px solid white;
            background: #ef4444;
            color: white;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 600;
            line-height: 1;
            transition: all 0.2s ease;
            z-index: 20;
            opacity: 0;
            transform: scale(0.9);
        }

        .grid-item:hover .delete-btn {
            opacity: 1;
            transform: scale(1);
        }

        .delete-btn:hover {
            background: #dc2626;
            transform: scale(1.05);
        }

        /* Simple button design */
        .choose-media-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.625rem 1rem;
            border: 1px solid #6366f1;
            border-radius: 0.375rem;
            background: #6366f1;
            font-weight: 600;
            font-size: 0.8rem;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .choose-media-btn::before {
            content: '📁';
            font-size: 0.875rem;
        }

        .choose-media-btn:hover {
            background: #5855f7;
            border-color: #5855f7;
            transform: translateY(-1px);
        }

        /* Minimal empty state */
        .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 2rem 1rem;
            color: #64748b;
            background: #f8fafc;
            border-radius: 0.375rem;
            border: 1px dashed #cbd5e1;
        }

        .empty-state p {
            margin: 0;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .empty-state::before {
            content: '📂';
            display: block;
            font-size: 2rem;
            margin-bottom: 0.375rem;
            opacity: 0.6;
        }

        .hidden {
            display: none !important;
        }

        /* Clean modal overlay */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }

        /* Minimal modal design */
        .modal-content {
            position: relative;
            background: #ffffff;
            padding: 1.5rem;
            border-radius: 0.5rem;
            width: 90%;
            max-width: 800px;
            height: 80vh;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }

        /* Simple close button */
        .modal-close-btn {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            background: #f1f5f9;
            border: none;
            width: 2rem;
            height: 2rem;
            border-radius: 0.25rem;
            font-size: 1rem;
            cursor: pointer;
            color: #64748b;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-close-btn:hover {
            background: #ef4444;
            color: white;
        }

        /* Compact form styling */
        .modal-filters {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: #f8fafc;
            border-radius: 0.375rem;
            border: 1px solid #e2e8f0;
        }

        .filter-group {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
        }

        .filter-group:last-child {
            margin-bottom: 0;
        }

        input[type="search"], select, button[type="submit"] {
            padding: 0.5rem 0.75rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.25rem;
            background: #ffffff;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s ease;
            outline: none;
        }

        input[type="search"] {
            flex: 1;
            min-width: 180px;
        }

        input[type="search"]:focus, select:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        select:hover {
            border-color: #94a3b8;
        }

        button[type="submit"] {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
            cursor: pointer;
            font-weight: 600;
        }

        button[type="submit"]:hover {
            background: #5855f7;
            border-color: #5855f7;
        }

        /* Compact action buttons */
        .attach-btn, .detach-btn {
            margin-top: 0.5rem;
            padding: 0.375rem 0.75rem;
            border: none;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .attach-btn {
            background: #10b981;
            color: white;
        }

        .attach-btn:hover {
            background: #059669;
        }

        .detach-btn {
            background: #f59e0b;
            color: white;
        }

        .detach-btn:hover {
            background: #d97706;
        }

        /* Simple pagination */
        .pagination {
            display: flex;
            justify-content: center;
            gap: 0.25rem;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }

        .pagination-link {
            padding: 0.375rem 0.625rem;
            border-radius: 0.25rem;
            text-decoration: none;
            color: #64748b;
            font-weight: 500;
            font-size: 0.8rem;
            transition: all 0.2s ease;
            background: #ffffff;
            border: 1px solid #e2e8f0;
        }

        .pagination-link:hover:not(.disabled) {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
        }

        .pagination-link.active {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
        }

        .pagination-link.disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Minimal loading and error states */
        .loading, .error {
            padding: 1.5rem;
            border-radius: 0.375rem;
            text-align: center;
            font-weight: 500;
        }

        .loading {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #64748b;
        }

        .loading::before {
            content: '⏳';
            display: block;
            font-size: 1.5rem;
            margin-bottom: 0.375rem;
        }

        .error {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
        }

        .error::before {
            content: '⚠️';
            display: block;
            font-size: 1.5rem;
            margin-bottom: 0.375rem;
        }

        /* Modal body scrolling */
        #modal-body {
            height: calc(100% - 1rem);
            overflow-y: auto;
            padding-right: 0.25rem;
        }

        /* Minimal scrollbar */
        #modal-body::-webkit-scrollbar {
            width: 4px;
        }

        #modal-body::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 2px;
        }

        #modal-body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
        }

        #modal-body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* Responsive design */
        @media (max-width: 640px) {
            .shelf-container {
                padding: 1rem;
            }

            .grid-container {
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 0.5rem;
            }

            .modal-content {
                width: 95%;
                height: 90vh;
                padding: 1rem;
            }

            .filter-group {
                flex-direction: column;
                gap: 0.5rem;
            }
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

    // Add change listeners for select dropdowns
    this.shadow.querySelector('#modal-type-select')?.addEventListener('change', this.handleFilterChange);
    this.shadow.querySelector('#modal-sort-select')?.addEventListener('change', this.handleFilterChange);
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
