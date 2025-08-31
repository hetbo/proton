import { ShelfFile, PaginatedFilesResponse, ModalFilters } from '../types/types';

export class EventHandlers {
    static createGridClickHandler(
        files: ShelfFile[],
        attachedFileIds: Set<number>,
        handleDelete: (fileId: number) => Promise<void>
    ) {
        return (event: Event) => {
            const target = event.target as HTMLElement;
            const deleteButton = target.closest('.delete-btn');

            if (deleteButton instanceof HTMLElement) {
                const fileId = parseInt(deleteButton.dataset.fileId || '0');
                if (fileId) {
                    handleDelete(fileId);
                }
            }
        };
    }

    static createChooseMediaHandler(
        files: ShelfFile[],
        setModalState: (isOpen: boolean, attachedIds: Set<number>, filters: ModalFilters) => void,
        fetchAndRenderModalData: () => Promise<void>
    ) {
        return () => {
            const attachedFileIds = new Set(files.map(f => f.id));
            const modalFilters = { search: '', sort: '-date', type: '', year: '', month: '' };
            setModalState(true, attachedFileIds, modalFilters);
            fetchAndRenderModalData();
        };
    }

    static createCloseModalHandler(setModalState: (isOpen: boolean) => void) {
        return () => {
            setModalState(false);
        };
    }

    static createModalClickHandler(
        modalData: PaginatedFilesResponse | null,
        attachedFileIds: Set<number>,
        handleAttach: (fileId: number) => Promise<void>,
        handleDelete: (fileId: number) => Promise<void>,
        handlePaginationClick: (url: string) => Promise<void>
    ) {
        return (event: Event) => {
            const target = event.target as HTMLElement;
            const paginationLink = target.closest('.pagination-link');
            const attachButton = target.closest('.attach-btn');
            const detachButton = target.closest('.detach-btn');

            if (paginationLink) {
                event.preventDefault();
                const url = paginationLink.getAttribute('data-url');
                if (url && !paginationLink.classList.contains('disabled')) {
                    handlePaginationClick(url);
                }
            }

            if (attachButton instanceof HTMLElement) {
                const fileId = parseInt(attachButton.dataset.fileId || '0');
                if (fileId) {
                    handleAttach(fileId);
                }
                return;
            }

            if (detachButton instanceof HTMLElement) {
                const fileId = parseInt(detachButton.dataset.fileId || '0');
                if (fileId) {
                    handleDelete(fileId);
                }
                return;
            }
        };
    }

    static createFilterSubmitHandler(
        modalFilters: ModalFilters,
        shadow: ShadowRoot,
        fetchAndRenderModalData: () => Promise<void>
    ) {
        return (event: Event) => {
            event.preventDefault();
            const searchInput = shadow.querySelector('#modal-search-input') as HTMLInputElement;
            if (searchInput) {
                modalFilters.search = searchInput.value;
            }
            fetchAndRenderModalData();
        };
    }

    static createFilterChangeHandler(
        modalFilters: ModalFilters,
        fetchAndRenderModalData: () => Promise<void>
    ) {
        return (event: Event) => {
            const target = event.target as HTMLSelectElement;

            if (target.id === 'modal-type-select') {
                modalFilters.type = target.value;
            }
            if (target.id === 'modal-sort-select') {
                modalFilters.sort = target.value;
            }
            fetchAndRenderModalData();
        };
    }
}
