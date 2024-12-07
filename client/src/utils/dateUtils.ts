import { format, formatDistanceToNow } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';

export const formatDateTime = (dateString: string, language: string = 'en') => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        return format(date, 'dd MMM yyyy, hh:mm a', {
            locale: language === 'en' ? enUS : hi
        });
    } catch (error) {
        console.error('Error formatting date:', error, 'Input:', dateString);
        return dateString;
    }
};

export const getTimeAgo = (dateString: string, language: string = 'en') => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        return formatDistanceToNow(date, {
            addSuffix: true,
            locale: language === 'en' ? enUS : hi
        });
    } catch (error) {
        console.error('Error calculating time ago:', error, 'Input:', dateString);
        return '';
    }
}; 