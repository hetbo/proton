// utils.ts
export class Utils {
    static getFileIcon(type: string): string {
        if (type.startsWith('image/') || type === 'image') return '🖼️';
        if (type.startsWith('video/') || type === 'video') return '🎬';
        if (type.startsWith('audio/') || type === 'audio') return '🎵';
        if (type.includes('document') || type === 'document') return '📄';
        if (type.includes('archive') || type === 'archive') return '📦';
        return '❔';
    }

    static renderLoading(styles: string): string {
        return `
            <style>${styles}</style>
            <div class="loading">
                <p>Loading files...</p>
            </div>
        `;
    }

    static renderError(message: string, styles: string): string {
        return `
            <style>${styles}</style>
            <div class="error">
                <p>${message}</p>
            </div>
        `;
    }
}
