import '../bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const rootElement = document.getElementById('app');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <>
            <App />
        </>
    );
} else {
    console.error('Failed to find the root element with ID "app".');
}
