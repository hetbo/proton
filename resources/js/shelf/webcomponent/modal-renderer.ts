import { PaginatedFilesResponse, ModalFilters, ShelfFile } from '../types/types';

export class ModalRenderer {
    static renderModalBody(
        isModalLoading: boolean,
        modalError: string | null,
        modalData: PaginatedFilesResponse | null,
        modalFilters: ModalFilters,
        attachedFileIds: Set<number>,
        getFileIcon: (type: string) => string
    ): string {
        if (isModalLoading) {
            return `<p>Loading media...</p>`;
        }

        if (modalError) {
            return `<p class="error">${modalError}</p>`;
        }

        const filtersHtml = this.renderFilters(modalFilters);

        if (modalData && modalData.data.length > 0) {
            const filesHtml = modalData.data.map(file => {
                const isAttached = attachedFileIds.has(file.id);

                const buttonHtml = isAttached
                    ? `<button class="detach-btn" data-file-id="${file.id}">Detach</button>`
                    : `<button class="attach-btn" data-file-id="${file.id}">Attach</button>`;

                return `
                    <div class="grid-item">
                        <div class="thumbnail">
                            ${file.type.startsWith('image')
                    ? `<img src="/storage/${file.path}" alt="${file.filename}" loading="lazy">`
                    : `<span class="icon">${getFileIcon(file.type)}</span>`
                }
                        </div>
                        <span class="filename">${file.filename}</span>
                        ${buttonHtml}
                    </div>
                `;
            }).join('');

            const paginationHtml = this.renderPagination(modalData);

            return `${filtersHtml}<div class="grid-container">${filesHtml}</div>${paginationHtml}`;
        }

        return `${filtersHtml}<p>No media found.</p>`;
    }

    private static renderFilters(modalFilters: ModalFilters): string {
        return `
            <form id="modal-filters-form" class="modal-filters">
                <div class="filter-group">
                    <input type="search" id="modal-search-input" placeholder="Search by filename..." value="${modalFilters.search}">
                    <button type="submit">Search</button>
                </div>
                <div class="filter-group">
                    <select id="modal-type-select">
                        <option value="">All Types</option>
                        <option value="image" ${modalFilters.type === 'image' ? 'selected' : ''}>Images</option>
                        <option value="video" ${modalFilters.type === 'video' ? 'selected' : ''}>Videos</option>
                        <option value="audio" ${modalFilters.type === 'audio' ? 'selected' : ''}>Audio</option>
                        <option value="document" ${modalFilters.type === 'document' ? 'selected' : ''}>Documents</option>
                        <option value="archive" ${modalFilters.type === 'archive' ? 'selected' : ''}>Archives</option>
                    </select>
                    <select id="modal-sort-select">
                        <option value="-date" ${modalFilters.sort === '-date' ? 'selected' : ''}>Newest First</option>
                        <option value="date" ${modalFilters.sort === 'date' ? 'selected' : ''}>Oldest First</option>
                        <option value="-size" ${modalFilters.sort === '-size' ? 'selected' : ''}>Size (Largest)</option>
                        <option value="size" ${modalFilters.sort === 'size' ? 'selected' : ''}>Size (Smallest)</option>
                    </select>
                </div>
            </form>
        `;
    }

    private static renderPagination(modalData: PaginatedFilesResponse): string {
        return `
            <div class="pagination">
                ${modalData.links.map(link => `
                    <a href="#"
                       class="pagination-link ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}"
                       data-url="${link.url || ''}">
                       ${link.label.replace(/&laquo;|&raquo;/g, '').trim()}
                    </a>
                `).join('')}
            </div>`;
    }
}
