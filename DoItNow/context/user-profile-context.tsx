
// AsyncStorage lets us save data locally on the device (line a mini database)
import AsyncStorage from '@react-native-async-storage/async-storage';

// User for nagivation (moving between screens in Expo apps)
import { router } from 'expo-router';

// React tools for state, context, and performance optimization
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// Custom theme hook (used to reset theme when user logs out)
import { useThemeMode } from '@/context/theme-mode-context';

// Clears saved tasks when user logs out/exits
import { clearTasks } from '@/utils/taskStorage';

// Key used to store user data in AsyncStorage
const STORAGE_KEY = '@doitnow/user_profile_v1'

// Possible session states
export type SessionKind = 'loading' | 'none' | 'guest' | 'user';

// Shape of stored guest data
type StoredGuest = { kind: 'guest'; name: string; avatar: string };

// Shape of stored logged-in user data
type StoredUser = { kind: 'user'; name: string, email: string, avatar: string };

// Combined type (eithe guest or user)
type Stored = StoredGuest | StoredUser;

// What our context provides to the app
type UserProfileContextValue = {
    hydrated: boolean;
    sessionKind: SessionKind;
    isGuest: boolean;
    isUser: boolean;
    name: string;
    email: string;
    avatar: string;

    setGuestSession: (input: { name: string, avatar?:string }) => Promise<void>;
    setUserSession: (input: { name: string; email: string; avatar?: string }) => Promise<void>;
    updateProfile: (input: Partial<{ name: string; email: string; avatar: string }>) => Promise<void>;
    exitGuest: () => Promise<void>;
    logoutUser: () => Promise<void>

};

// Default avatar if none is provided
const defaultAvatar = '😎'

// Create the context (initially empty)
const UserProfileContext = createContext<UserProfileContextValue | null>(null);

// Function to read user data from AsyncStorage
async function readStored(): Promise<Stored | null> {
    try {

        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        // If nothing saved, return null
        if (!raw) return null;

        // Convert string back to object
        const p = JSON.parse(raw) as Stored;

        // Validate guest data
        if (p?.kind === 'guest' && typeof p.name === 'string' && typeof p.avatar === 'string') {
            return { kind: 'guest', name: p.name, avatar: p.avatar };
        }

        // Validate user data
        if (
            p?.kind === 'user' &&
            typeof p.name === 'string' &&
            typeof p.email === 'string' &&
            typeof p.avatar === 'string'
        ) {
            return { kind: 'user', name: p.name, email: p.email, avatar: p.avatar };
        }

        return null;

    } catch {
        return null;
    }
}

// Save or delete user data in AsyncStorage
async function writeStored(data: Stored | null): Promise<void> {
    try {
        // If null, remove stored data
        if (data == null) {
            await AsyncStorage.removeItem(STORAGE_KEY);
            return;
        }

        // Otherwise, save data as string
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
}

// Main Provider that wraps the app and gives access to user state
export function UserProfileProvider({ children }: { children: ReactNode }) {
    const { resetThemePreference } = useThemeMode();

    // Tracks whether storage data has loaded
    const [hydrated, setHydrated] = useState(false);

    // Tracks session type (guest/user/none/loading)
    const [sessionKind, setSessionKind] = useState<SessionKind>('loading');

    // User info storage in state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(defaultAvatar);

    // Load saved user data when app starts
    useEffect(() => {
        let cancelled = false;

        (async () => {

            // Read saved data
            const stored = await readStored();

            if (cancelled) return;

            // No saved data --> no session
            if (!stored) {
                setSessionKind('none');
                setName('');
                setEmail('');
                setAvatar(defaultAvatar);
            }

            // Guest session loaded
            else if (stored.kind === 'guest') {
                setSessionKind('guest');
                setName(stored.name);
                setEmail('');
                setAvatar(stored.avatar);
            }

            // Logged-in user
            else {
                setSessionKind('user');
                setName(stored.name);
                setEmail(stored.email);
                setAvatar(stored.avatar);
            }

            // Mark as finished loading
            setHydrated(true);
        })();

        // cleanup if component unmounts
        return () => {
            cancelled = true;
        };
    }, []);

    // Update both storage and state together
    const persistFromState = useCallback(async (kind: 'guest' | 'user', next: {name: string; email: string, avatar: string }) => {
        // If guest...
        if (kind === 'guest') {

            // Build guest object
            const data: StoredGuest = { kind: 'guest', name: next.name, avatar: next.avatar };

            // Save to storage
            await writeStored(data);

            // Update state
            setSessionKind('guest');
            setName(next.name);
            setEmail('');
            setAvatar(next.avatar);
            return;
        }

        // Build user object
        const data: StoredUser = { kind: 'user', name: next.name, email: next.email, avatar: next.avatar };

        await writeStored(data);

        // Update state
        setSessionKind('user');
        setName(next.name);
        setEmail(next.email);
        setAvatar(next.avatar);
    }, []);

    const setGuestSession = useCallback(
        async (input: {name: string, avatar?: string }) => {

            //remove extra spaces
            const trimmed = input.name.trim();

            // if empty, use guest
            const nextName = trimmed.length > 0 ? trimmed: 'Guest';

            // Use provided avatar or default
            const nextAvatar = input.avatar ?? defaultAvatar;

            await persistFromState('guest', {name: nextName, email: '', avatar: nextAvatar});
        }, [persistFromState]
    );

    // Create a logged-in user session
    const setUserSession = useCallback (
        async (input: {name: string, email: string; avatar?: string }) => {
            // '??' --> if the first value is null/undefined, use the second value
            const nextAvatar = input.avatar ?? defaultAvatar;

            await persistFromState( 'user', {
                name: input.name.trim(),
                email: input.email.trim(),
                avatar: nextAvatar,
            });
        }, [persistFromState]
    );

    // Update existing profile data (guest or user)
    const updateProfile = useCallback(
        // Partial<> --> a type that allows for partial updates to an object
        async (input: Partial<{ name: string; email: string; avatar: string }>) => {

            // Ignore if session is not loaded
            if (sessionKind !== 'guest' && sessionKind !== 'user') return;

            // Keep old values if new ones are not provided
            const nextName = input.name !== undefined ? input.name : name;
            const nextEmail = input.email !== undefined ? input.email : email;
            const nextAvatar = input.avatar !== undefined ? input.avatar : avatar;

            // Special rules for guest (no email)
            if (sessionKind === 'guest') {
                await persistFromState('guest', {
                    name: nextName.trim() || 'Guest',
                    email: '',
                    avatar: nextAvatar,
                });
                return;
            }

            // Update normal user
            await persistFromState('user', {
                name: nextName.trim(),
                email: nextEmail.trim(),
                avatar: nextAvatar,
            });
        }, [sessionKind, name, email, avatar, persistFromState]
    );

    // Clears guest session and sends user to login screen
    const exitGuest = useCallback( async() => {
        await resetThemePreference();
        await clearTasks();
        await writeStored(null);

        setSessionKind('none');
        setName('');
        setEmail('');
        setAvatar(defaultAvatar);

        router.replace('/login');
    }, [resetThemePreference]);

    // Logs out full user account
    const logoutUser = useCallback( async() => {
        await resetThemePreference();
        await clearTasks();
        await writeStored(null);

        setSessionKind('none');
        setName('');
        setEmail('');
        setAvatar(defaultAvatar);

        router.replace('/login');
    }, [resetThemePreference]);

    // Final value exposed globally through context
    const value = useMemo(
        () => ({
            hydrated,
            sessionKind,
            isGuest: sessionKind === 'guest',
            isUser: sessionKind === 'user',
            name,
            email,
            avatar,
            setGuestSession,
            setUserSession,
            updateProfile,
            exitGuest,
            logoutUser,
        }),
        [hydrated, sessionKind, name, email, avatar, setGuestSession, setUserSession, updateProfile, exitGuest, logoutUser]
    );

    return <UserProfileContext.Provider value ={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile(): UserProfileContextValue {
    const ctx: useContext(UserProfileContext);

    if (!ctx) {
        throw new Error('useUserProfile must be used within UserProfileProvider')
    }

    // Return the context data so other parts of the app can use it
    return ctx;
}
