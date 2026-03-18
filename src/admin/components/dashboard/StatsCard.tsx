import React from 'react';

interface StatsCardProps {
    title: string;
    value: string;
    isPositive?: boolean;
    className?: string;
    previousValue?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    className,
}) => {
    return (
        <div className={`bg-primary-background p-6 rounded-2xl shadow-sm relative ${className}`}>
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-text-primary text-lg font-sans">{title}</h3>
            </div>
            <p className="text-text-secondary text-xs mb-6 font-sans">Last 7 days</p>

            {title === 'Total Website Visits' ? (
                <div className="flex items-start gap-8">
                    <div>
                        <p className="text-xs text-text-secondary mb-1 font-sans font-medium">Visits</p>
                        <h3 className="text-3xl font-bold text-text-primary font-sans">{value}</h3>
                    </div>
                </div>
            ) : (
                <div className="mb-2">
                    <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="text-4xl font-bold text-text-primary font-sans tracking-tight">{value}</h3>
                        {title === 'Total Sales' && <span className="text-sm text-text-primary font-medium">Orders</span>}
                    </div>
                </div>
            )}
        </div>
    );
};
