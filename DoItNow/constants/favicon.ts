
import faviconAppleDark from '../assets/images/apple-touch-icon-dark.png';
import faviconAppleLight from '../assets/images/apple-touch-icon.png';
import faviconPngDark from '../assets/images/favicon-dark.png';
import faviconPngLight from '../assets/images/favicon.png';

export const FAVICON_VERSION = '14';

const v = '?v=${FAVICON_VERSION}';

export const WEB_FAVICON_PNG_LIGHT = '${faviconPngLight}${v}';
export const WEB_FAVICON_PNG_DARK = '${faviconPngDark}${v}';
export const WEB_APPLE_TOUCH_LIGHT = '${faviconAppleLight}${v}';
export const WEB_APPLE_TOUCH_DARK = '${faviconAppleDark}${v}';
