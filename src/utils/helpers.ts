// This file exports utility functions that can be used throughout the application for common tasks.

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US');
};

export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
};

export const generateRandomId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};