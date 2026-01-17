import React from 'react';
import clsx from 'clsx';

const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={clsx("animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md", className)}
            {...props}
        />
    );
};

export default Skeleton;
