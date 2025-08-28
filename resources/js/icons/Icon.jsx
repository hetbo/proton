import React, { Suspense } from 'react';
import * as Icons from './index';

const Icon = ({ name, className = '' }) => {
    const IconComponent = Icons[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found.`);
        return null;
    }

    const defaultClasses = 'shelf:h-5 shelf:w-5';

    return (
        <Suspense fallback={null}>
            <IconComponent className={`${defaultClasses} ${className}`} />
        </Suspense>
    );
};

export default Icon;
