import '../bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import FileManager from "./components/FileManager";

const rootElement = document.getElementById('app');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <>
            <FileManager />
        </>
    );
} else {
    console.error('Failed to find the root element with ID "app".');
}
