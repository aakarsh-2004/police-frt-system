const EMAIL_HISTORY_KEY = 'recentEmails';
const MAX_RECENT_EMAILS = 2;

export const getRecentEmails = (): string[] => {
    try {
        const storedEmails = localStorage.getItem(EMAIL_HISTORY_KEY);
        if (!storedEmails) {
            console.log('No emails found in localStorage');
            return [];
        }
        
        const parsedEmails = JSON.parse(storedEmails);
        if (!Array.isArray(parsedEmails)) {
            console.log('Stored emails is not an array, resetting');
            localStorage.removeItem(EMAIL_HISTORY_KEY);
            return [];
        }
        
        console.log('Retrieved emails:', parsedEmails);
        return parsedEmails;
    } catch (error) {
        console.error('Error retrieving emails:', error);
        localStorage.removeItem(EMAIL_HISTORY_KEY);
        return [];
    }
};

export const addRecentEmail = (email: string): void => {
    if (!email || typeof email !== 'string') {
        console.log('Invalid email provided');
        return;
    }

    try {
        const currentEmails = getRecentEmails();
        const normalizedEmail = email.toLowerCase().trim();
        
        // Remove duplicates and add new email at the start
        const updatedEmails = [
            normalizedEmail,
            ...currentEmails.filter(e => e.toLowerCase() !== normalizedEmail)
        ].slice(0, MAX_RECENT_EMAILS);

        localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(updatedEmails));
        console.log('Saved emails:', updatedEmails);
    } catch (error) {
        console.error('Error saving email:', error);
    }
};

// Add this function to help with testing
export const clearRecentEmails = (): void => {
    localStorage.removeItem(EMAIL_HISTORY_KEY);
    console.log('Cleared recent emails');
}; 