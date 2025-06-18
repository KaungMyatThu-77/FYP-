import React from 'react';

interface LoadingProps {
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false }) => {
    if (fullScreen) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return <span className="loading loading-spinner loading-md"></span>;
};

export default Loading;
