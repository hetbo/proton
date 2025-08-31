export interface ShelfFile {
    id: number;
    filename: string;
    path: string;
    mime_type?: string;
    size?: number;
    formatted_size: string;
    type: string;
    created_at: string;
    updated_at: string;
    metadata?: Metadata[];
    fileables?: Fileable[];
}

export interface Metadata {
    id: number;
    file_id: number;
    key: string;
    value: string;
}

export interface Fileable {
    id: number;
    file_id: number;
    fileable_id: number;
    role: string;
    type: string;
}

export interface ModalFilters {
    search: string;
    sort: string;
    type: string;
    year: string;
    month: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface FilterOptions {
    type?: 'image' | 'video' | 'audio' | 'document' | 'archive';
    year?: number;
    month?: number;
    sort?: 'date' | 'size' | '-size';
    search?: string;
    page?: number;
}

export interface DetachResponse {
    success: boolean;
    message?: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedFilesResponse {
    current_page: number;
    data: ShelfFile[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface AttachResponse {
    success: boolean;
    message?: string;
    data?: ShelfFile;
}

export type ViewMode = 'list' | 'grid';
