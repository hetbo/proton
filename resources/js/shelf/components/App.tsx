import React from 'react';
import Icon from "../../icons/Icon";
import {ArchiveIcon} from "../../icons";

function App(): React.ReactElement {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Hello from React + TypeScript!</h1>
            <p>This component is rendered inside a Laravel Blade file.</p>
            <Icon name="ArchiveIcon" className="w-5 h-5" />
        </div>
    );
}

export default App;
