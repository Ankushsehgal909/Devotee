/**
 * Safe localization resolver for Devotee mobile app.
 * Resolves localized strings ({ en: '...', hi: '...' }), plain strings, numbers, and nested objects.
 * Guarantees that raw objects are never passed directly as React children.
 */

export type LocalizedValue =
  | string
  | number
  | boolean
  | { en?: string; hi?: string; [key: string]: any }
  | null
  | undefined;

/**
 * Safely extracts a display string from any localized or plain value.
 * Handles strings, { en: '...', hi: '...' }, nested objects, numbers, and null/undefined.
 * Prevents React child object rendering errors: "Objects are not valid as a React child (found: object with keys {en})"
 */
export function resolveLocalizedText(
  value: any,
  fallback = '',
  lang: 'en' | 'hi' = 'en'
): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    // Direct localized object: { en: '...', hi: '...' }
    if (lang === 'hi' && typeof value.hi === 'string' && value.hi.trim()) {
      return value.hi.trim();
    }
    if (typeof value.en === 'string' && value.en.trim()) {
      return value.en.trim();
    }
    if (typeof value.hi === 'string' && value.hi.trim()) {
      return value.hi.trim();
    }

    // Common nested objects like significance: { what: { en: '...' }, why: { en: '...' }, benefits: { en: '...' } }
    if (value.what || value.why || value.benefits) {
      const parts = [
        resolveLocalizedText(value.what),
        resolveLocalizedText(value.why),
        resolveLocalizedText(value.benefits),
      ].filter(Boolean);
      if (parts.length > 0) {
        return parts.join('\n\n');
      }
    }

    // Look for any string value in the object
    for (const key of Object.keys(value)) {
      const subVal = value[key];
      if (typeof subVal === 'string' && subVal.trim()) {
        return subVal.trim();
      }
      if (typeof subVal === 'object' && subVal !== null) {
        const resolved = resolveLocalizedText(subVal);
        if (resolved) return resolved;
      }
    }
  }

  return fallback;
}
