import { format, formatDistanceToNow } from 'date-fns';
import { enUS, hi } from 'date-fns/locale';

export const formatDateTime = (dateString: string, language: string = 'en') => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return dateString;
        }

        return format(date, 'MMM d, yyyy hh:mm:ss aa', {
            locale: language === 'en' ? enUS : hi
        });
    } catch (error) {
        console.error('Error formatting date:', error, 'Input:', dateString);
        return dateString;
    }
};

export const getTimeAgo = (dateString: string, language: string = 'en') => {
    try {
        dateString = dateString.split('T')[0] + ' ' + dateString.split('T')[1].split('.')[0];
        
        const [date, time] = dateString.split(' ');
        if (!date || !time) {
            console.error('Invalid datetime format:', dateString);
            return '';
        }
        
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        if (!year || !month || !day || !hours || !minutes || !seconds) {
            console.error('Invalid date/time components:', { year, month, day, hours, minutes, seconds });
            return '';
        }
        
        const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
        return formatDistanceToNow(localDate, {
            addSuffix: true,
            locale: language === 'en' ? enUS : hi
        });
    } catch (error) {
        console.error('Error calculating time ago:', error, 'Input:', dateString);
        return '';
    }
}; 