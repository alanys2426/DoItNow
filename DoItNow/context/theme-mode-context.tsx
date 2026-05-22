
// Import AsyncStorage for saving theme preference on device
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import React tools for state, context, lifecycle, and performance optimization
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Import React Native tools for detecting system theme + platform type
import { ColorSchemeName, Platform, useColorScheme as useRNColorScheme } from 'react-native'

/*

    PropsWithChildren --> A type helper that adds children to props
        + So you don't manually type children
        + EX:
            type Props = PropsWithChildren<{
                title: string;
            }>;
    useRNColorScheme --> A hook that gives system theme (light/dark)
        + React Native built-in hook

*/

export type ThemeMode = 'system' | 'light' | 'dark';

// Type definition for browser window (used only on web)
type WebWindow = {
    matchMedia: (query: string) => {
        matches: boolean;
        addEventListener: (type: 'change', listener: () => void) => void;
        removeEventListener: (type: 'change', listener: () => void) => void;
    };
};

/*

    matchMedia --> Browser API for detecting CSS media queries
        + Only works on web
        + EX: window.matchMedia("(prefers-color-scheme": dark)");
            - Checks if user prefers dark mode
    matches --> result of matchMedia
        + EX:
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            console.log(mq.matches);
    addEventListener --> attaches event listener
        + EX:
            mq.addEventListener("change", () => {
                console.log("theme changed")
            });
    removeEventListener --> Removes event listener
        + EX: mq.removeEventListener("change", handler)

*/

// Safely get the browser window (only exists on web)
function getBrowserWindow(): WebWindow | undefined {
    return (globalThis as unknown as { window?: WebWindow }).window;
}

// Read system them preference from browser (light or dark)
function readPrefersColorScheme(): ColorSchemeName {
    const w = getBrowserWindow();

    // If no window or matchMedia exists, default to light
    if ( !w?.matchMedia) return 'light';

    try {
        // Check if user prefers dark mode in browser
        return w.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
        // Fallback if something fails
        return 'light';
    }
    
}

/*

    globalThis --> Universal reference to global scope
        + globalThis.console.log("hi");
    Platform.OS
        + Tells what platform app is running on
        + EX:
            import { Platform } from "react-native";

            if (Platform.OS === "web") {
                console.log("running on web");
            }
    ReturnType<T>
        + TypeScript utility type
        + Gets the return type of a function

*/

// Custom hook to get system theme (works on web + native)
function useSystemAppearance(): ColorSchemeName {
    const rnScheme = useRNColorScheme(); // Native system theme

    // State for web theme tracking
    const [webScheme, setWebScheme] = useState<ColorSchemeName>(() => {
        // If not web, just use native theme
        if (Platform.OS !== 'web') return rnScheme ?? 'light';

        // If webm read browser preference
        return readPrefersColorScheme();
    });

    useEffect(() => {
        // Only run this logic on web
        if (Platform.OS !== 'web') return;

        const w = getBrowserWindow();
        if(!w?.matchMedia) return;

        let mq: ReturnType<WebWindow['matchMedia']>;

        try {
            // Listen to system theme changes (dark/light toggle)
            mq = w.matchMedia('(prefers-color-scheme: dark)');
        } catch {
            return;
        }

        // Function to update theme state
        const sync = () => setWebScheme(mq.matches ? 'dark' : 'light');

        // Set initial value
        sync();

        // Listen for change in system theme
        mq.addEventListener('change', sync);

        // Cleanup listener when component unmounts
        return () => mq.removeEventListener('change', sync);
    }, []);

    // Return correct system theme depending on platform
    if (Platform.OS === 'web') {
        return webScheme;
    }

    // Native fallback
    return rnScheme ?? 'light';
}

// Shape of what our Theme Context will provide
type ThemeContextValue = {
    mode: ThemeMode; // current saved mode (system/light/dark)
    setMode: (next: ThemeMode) => void; // function to change mode
    resetThemePreference: () => Promise<void>; // reset to system default
    resolvedScheme: ColorSchemeName; // final computed theme
};

// Key used to store theme in AsyncStorage
const STORAGE_KEY = 'doitnow_theme_mode';

// Create React context (intially empty)
const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

// Provider component that wraps the app and manages theme state
export function ThemeModeProvider({ children }: PropsWithChildren) {

    // Get system theme (light/dark depending on device on browser)
    const systemScheme = useSystemAppearance();

    // Store user-selected theme mode
    const [mode, setModeState] = useState<ThemeMode>('system')

    // Load saved theme from AsyncStorage when app starts
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((storedMode) => {
                // Only accept valid saved values
                if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'system') {
                    setModeState(storedMode);
                }
            })
            .catch(() => {
                // Ignore errors (fail silently)
            });
    }, []);

    // Function to change theme and save it
    const setMode = useCallback((next: ThemeMode) => {
        setModeState(next); //update state immediately

        // save to device storage (async, ignore errors)
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    }, []);

    // Reset theme back to system defaut
    const resetThemePreference = useCallback(async () => {
        setModeState('system');

        try {
            // REmove saved theme
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch {}
    }, []);

    // Decide final active theme
    const resolvedScheme: ColorSchemeName = 
        mode === 'system'
        // '??' --> Nullish Operator
        //  + Means "Use the left value unless it is null or undefined"
        ? systemScheme ?? 'light'
        :mode

    // Memoize context value for performance
    const value = useMemo(
        () => ({
            mode,
            setMode,
            resetThemePreference,
            resolvedScheme.
        }),
        [mode, resetThemePreference, resolvedScheme, setMode]
    );

    // Provide theme data to children
    return (
        <ThemeModeContext.Provider value={value}>
            {children}
        </ThemeModeContext.Provider>
    );
}

// Custom hook to use theme context
export function useThemeMode() {
    // Get context value
    const context = useContext(ThemeModeContext);

    // Throw error if used outside provider
    if (!context) {
        throw new Error(
            'useThemeMode must be used within ThemeModeProvider'
        );
    }

    // Return theme context
    return context;
}
