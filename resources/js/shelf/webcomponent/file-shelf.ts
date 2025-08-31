import { ShelfFile, PaginatedFilesResponse, ModalFilters } from '../types/types';
import { fileShelfStyles } from './file-shelf-css';
import { ApiService } from './api-service';
import { ModalRenderer } from './modal-renderer';
import { EventHandlers } from './event-handlers';
import { Utils } from './utils';

export class FileShelf extends HTMLElement {
    private shadow: ShadowRoot;
    private files: ShelfFile[] = [];
    private isModalOpen: boolean = false;
    private modalContent: string = '<p>I am an empty modal.</p>';

    private modalData: PaginatedFilesResponse | null = null;
    private isModalLoading: boolean = false;
    private modalError: string | null = null;

    private attachedFileIds: Set<number> = new Set();

    private modalFilters: ModalFilters = {
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
            this.files = await ApiService.fetchFiles(modelType, modelId, role);
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
            this.modalData = await ApiService.fetchModalData(url);
        } catch (error) {
            this.modalError = error instanceof Error ? error.message : 'Could not load media.';
        } finally {
            this.isModalLoading = false;
            this.render();
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
            const modelType = this.getAttribute('model-type')!;
            const modelId = this.getAttribute('model-id')!;
            const role = this.getAttribute('role')!;
            await ApiService.detachFile(modelType, modelId, role, fileId);
        } catch (error) {
            console.error('Failed to detach file:', error);
            this.files = originalFiles;
            this.attachedFileIds.add(fileId);
            this.render();

            alert(error instanceof Error ? error.message : 'Could not remove the file. Please try again.');
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
            const modelType = this.getAttribute('model-type')!;
            const modelId = this.getAttribute('model-id')!;
            const role = this.getAttribute('role')!;
            await ApiService.attachFile(modelType, modelId, role, fileId);
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
            this.modalData = await ApiService.fetchModalData(url);
        } catch (error) {
            this.modalError = error instanceof Error ? error.message : 'Could not load page.';
        } finally {
            this.isModalLoading = false;
            this.render();
        }
    }

    private getStyles(): string {
        return fileShelfStyles;
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
                : `<span class="icon">${Utils.getFileIcon(file.type)}</span>`
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
        return ModalRenderer.renderModalBody(
            this.isModalLoading,
            this.modalError,
            this.modalData,
            this.modalFilters,
            this.attachedFileIds,
            Utils.getFileIcon
        );
    }

    private attachEventListeners() {
        const gridClickHandler = EventHandlers.createGridClickHandler(
            this.files,
            this.attachedFileIds,
            this.handleDelete.bind(this)
        );

        const chooseMediaHandler = EventHandlers.createChooseMediaHandler(
            this.files,
            (isOpen, attachedIds, filters) => {
                this.isModalOpen = isOpen;
                if (attachedIds) this.attachedFileIds = attachedIds;
                if (filters) this.modalFilters = filters;
            },
            this.fetchAndRenderModalData.bind(this)
        );

        const closeModalHandler = EventHandlers.createCloseModalHandler(
            (isOpen) => {
                this.isModalOpen = isOpen;
                if (!isOpen) {
                    this.modalData = null;
                    this.modalError = null;
                    this.render();
                }
            }
        );

        const modalClickHandler = EventHandlers.createModalClickHandler(
            this.modalData,
            this.attachedFileIds,
            this.handleAttach.bind(this),
            this.handleDelete.bind(this),
            this.handlePaginationClick.bind(this)
        );

        const filterSubmitHandler = EventHandlers.createFilterSubmitHandler(
            this.modalFilters,
            this.shadow,
            this.fetchAndRenderModalData.bind(this)
        );

        const filterChangeHandler = EventHandlers.createFilterChangeHandler(
            this.modalFilters,
            this.fetchAndRenderModalData.bind(this)
        );

        this.shadow.querySelector('.grid-container')?.addEventListener('click', gridClickHandler);
        this.shadow.querySelector('#choose-media-btn')?.addEventListener('click', chooseMediaHandler);
        this.shadow.querySelector('#modal-close-btn')?.addEventListener('click', closeModalHandler);
        this.shadow.querySelector('.modal-content')?.addEventListener('click', modalClickHandler);
        this.shadow.querySelector('#modal-filters-form')?.addEventListener('submit', filterSubmitHandler);
        this.shadow.querySelector('#modal-type-select')?.addEventListener('change', filterChangeHandler);
        this.shadow.querySelector('#modal-sort-select')?.addEventListener('change', filterChangeHandler);
    }

    private renderLoading() {
        this.shadow.innerHTML = Utils.renderLoading(this.getStyles());
    }

    private renderError(message: string) {
        this.shadow.innerHTML = Utils.renderError(message, this.getStyles());
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
