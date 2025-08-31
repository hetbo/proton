export const fileShelfStyles = `
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
        }`;
