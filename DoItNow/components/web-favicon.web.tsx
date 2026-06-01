
/*
    href
        + URL (path to a file)
        + EX: favicon.png
    DOM basics
        + document --> the whole webpage
        + document.getElementById("x")
            - Finds the HTML element with this id
    HTMLLinkElement
        + Used for checking type
        + EX: vairable_name instanceof HTMLLinkElement
            - "Is this a <link>?"
    parentNode
        + The thing that contains this element
        + EX:
            <head>
                <link>
            </head>
            - parent of <link> is <head>
    createElement("link")
        + Makes a New <link> tag in memory
    getAttribute("rel")
        + Reads HTML attributes
    replaceChild(new, old)
        + Swaps elements in the page
    useLayoutEffect
        + Runs code...
            - AFTER React updates the page
            - BEFORE the screen shows it
        + Used to avoid flicker
    resolvedScheme
        + Comes from useThemeMode()
        + Tells you current theme ('light' or 'dark')
        
*/

/// <reference lib="dom" />
// ^ Gives TS access to browser DOM types (like document, HTMLLinkElement, etc.)

import { useLayoutEffect } from 'react';
import { Platform } from 'react-native';

import {
    WEB_APPLE_TOUCH_DARK,
    WEB_APPLE_TOUCH_LIGHT,
    WEB_FAVICON_PNG_DARK,
    WEB_FAVICON_PNG_LIGHT,
} from '@/constants/favicon';

// Custom hook that tells us if the app is in light or dark mode
import { useThemeMode } from '@/context/theme-mode-context';

// Helper function: replaces an existing <link> tag in the HTML head
function replaceLinkById(id: string, href: string) {

    // Find an element in the document by its ID
    const el = document.getElementById(id);

    // If it doesn't exist or is not a <link>, stop here
    if (!(el instanceof HTMLLinkElement) || !el.parentNode) return;

    // Create a new <link> element (we replace instead of editing directly)
    const next = document.createElement('link');

    // Keep the same ID so it can still be found later
    next.id = id;

    // Copy the "rel" attribute (e.g. icon, shortcut icon)
    const rel = el.getAttribute('rel');
    if (rel) next.setAttribute('rel', rel);

    // Copy the "type" attribtue if it exists
    const type = el.getAttribute('type');
    if (type) next.type = type;

    // Copy the "sizes" attribute (used for differnet icon sizes)
    const sizes = el.getAttribute('sizes');
    if (sizes) next.setAttribute('sizes', sizes);

    // Set the new image path (favicon or apple touch icon)
    next.href = href;

    // Replace the old <link> with the new one in the DOM
    el.parentNode.replaceChild(next, el);
}

// React component that keeps the favicon in sync with theme
export function WebFaviconSync() {
    // Get current theme (light or dark)
    const { resolvedScheme } = useThemeMode();

    useLayoutEffect(() => {
        // Only run this logic in a web environment
        if (Platform.OS !== 'web') return;

        // Check if the theme is dark
        const dark = resolvedScheme === 'dark';

        // Pick correct favicon based on the theme
        const png = dark ? WEB_FAVICON_PNG_DARK : WEB_FAVICON_PNG_LIGHT;

        // Pick correct Apple touch icon based on theme
        const apple = dark ? WEB_APPLE_TOUCH_DARK : WEB_APPLE_TOUCH_LIGHT;

        // Update different favicon link tags in the HTML
        replaceLinkById('web-favicon-shortcut', png);
        replaceLinkById('web-favicon-32', png);
        replaceLinkById('web-favicon-png-any', png);
        replaceLinkById('web-favicon-apple', apple);
    }, [resolvedScheme]);

    // This component doesn't render anything visible
    return null;
}
