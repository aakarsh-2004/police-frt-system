import React, { createContext, useContext, useState } from 'react';

interface LoginThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const LoginThemeContext = createContext<LoginThemeContextType | undefined>(undefined);

export function LoginThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <LoginThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </LoginThemeContext.Provider>
    );
}

export function useLoginTheme() {
    const context = useContext(LoginThemeContext);
    if (context === undefined) {
        throw new Error('useLoginTheme must be used within a LoginThemeProvider');
    }
    return context;
} 