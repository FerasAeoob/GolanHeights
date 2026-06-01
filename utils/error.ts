export function getErrorMessage(data: any, dict: any): string {
    if (!data) return dict?.errors?.UNKNOWN_ERROR || "Something went wrong. Please try again.";

    // Built-in English fallbacks for every known error code.
    // These fire when dict.errors is missing (e.g. statically cached pages).
    const BUILTIN: Record<string, string> = {
        // Auth & Access
        INVALID_CREDENTIALS: "Invalid email or password.",
        EMAIL_ALREADY_EXISTS: "Email is already in use.",
        PHONE_ALREADY_EXISTS: "Phone number is already in use.",
        UNAUTHORIZED: "You must be logged in.",
        FORBIDDEN: "You do not have permission to do this.",
        USER_NOT_FOUND: "User not found.",
        VALIDATION_FAILED: "Validation failed.",
        RATE_LIMITED: "Too many attempts. Please wait 15 minutes.",
        SERVER_ERROR: "An unexpected server error occurred. Please try again later.",
        RESEND_EMAIL_ERROR: "Failed to send email. Please try again.",
        EMAIL_SEND_FAILED: "Failed to send email. Please try again.",
        INVALID_TOKEN: "The link is invalid or has expired.",
        TOKEN_EXPIRED: "The link has expired.",
        NETWORK_ERROR: "Network error. Please check your connection and try again.",
        EMAIL_NOT_VERIFIED: "Your email is not verified. Please check your inbox or request a new verification email.",

        // Password Constraints
        PASSWORD_TOO_SHORT: "Password must be at least 8 characters long.",
        PASSWORD_TOO_LONG: "Password cannot exceed 72 characters.",
        PASSWORD_TOO_WEAK: "Password is too weak. Use uppercase, lowercase, numbers, and special characters.",
        PASSWORD_MISSING_UPPERCASE: "Password must contain at least one uppercase letter.",
        PASSWORD_MISSING_LOWERCASE: "Password must contain at least one lowercase letter.",
        PASSWORD_MISSING_NUMBER: "Password must contain at least one number.",
        PASSWORD_MISSING_SPECIAL: "Password must contain at least one special character.",
        PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
        PASSWORDS_REQUIRED: "Please fill in all password fields.",
        CURRENT_PASSWORD_INCORRECT: "Current password is incorrect.",
        NEW_PASSWORD_SAME_AS_CURRENT: "New password cannot be the same as the current password.",

        // User Fields
        INVALID_EMAIL: "Invalid email address.",
        INVALID_PHONE: "Invalid phone number.",
        NAME_TOO_SHORT: "Name must be at least 2 characters.",
        NAME_TOO_LONG: "Name cannot exceed 50 characters.",
        NAME_INVALID: "Name must be between 2 and 50 characters.",
        FILL_ALL: "Please fill in all required fields.",
        TERMS_NOT_ACCEPTED: "You must accept the Terms of Use and Privacy Policy.",

        // Profile
        PROFILE_UPDATE_FAILED: "Failed to update profile.",

        // Avatar / Upload
        UPLOAD_FAILED: "Upload failed. Please try again.",
        UPLOAD_TOO_LARGE: "Image must be under 5MB.",
        IMAGE_TOO_LARGE: "Image must be under 5MB.",
        AVATAR_REMOVE_FAILED: "Failed to remove photo. Please try again.",

        // Reviews
        REVIEW_EMPTY: "Review cannot be empty.",
        REVIEW_TOO_LONG: "Review is too long.",
        REVIEW_SAVE_FAILED: "Failed to save your review. Please try again.",
        REVIEW_DELETE_FAILED: "Failed to delete your review. Please try again.",
        REVIEW_LOAD_FAILED: "Failed to load reviews. Please refresh the page.",
        RATING_TOO_LOW: "Rating must be at least 1.",
        RATING_TOO_HIGH: "Rating cannot exceed 5.",

        // Comments
        COMMENT_EMPTY: "Comment cannot be empty.",
        COMMENT_TOO_LONG: "Comment is too long.",

        // Favorites
        FAVORITE_FAILED: "Failed to update favorites.",
        LOGIN_REQUIRED: "You must be logged in.",

        // Places & Slug Uniqueness
        PLACE_NOT_FOUND: "Place not found.",
        PLACE_ALREADY_GONE: "Place no longer exists.",
        PLACE_CREATE_FAILED: "Failed to create place.",
        PLACE_UPDATE_FAILED: "Failed to update place.",
        PLACE_DELETE_FAILED: "Failed to delete place.",
        SLUG_EN_ALREADY_EXISTS: "The English slug is already taken.",
        SLUG_HE_ALREADY_EXISTS: "The Hebrew slug is already taken.",
        SLUG_AR_ALREADY_EXISTS: "The Arabic slug is already taken.",

        // Generic
        NOT_FOUND: "Not found.",
        UNKNOWN_ERROR: "Something went wrong. Please try again.",
    };

    // A comprehensive mapping from raw English strings, system codes, or Zod issue codes
    // to our standard dictionary keys. All normalized forms are UPPERCASE with underscores.
    const STRING_TO_CODE: Record<string, string> = {
        // Rate Limiting
        "RATE_LIMITED": "RATE_LIMITED",
        "RATE-LIMITED": "RATE_LIMITED",
        "TOO_MANY_REQUESTS": "RATE_LIMITED",
        "TOO_MANY_ATTEMPTS": "RATE_LIMITED",
        "YOU_HAVE_MADE_TOO_MANY_ATTEMPTS_PLEASE_WAIT_15_MINUTES": "RATE_LIMITED",
        "TOO_MANY_ATTEMPTS_PLEASE_WAIT_15_MINUTES": "RATE_LIMITED",

        // Auth & Validation
        "INVALID_CREDENTIALS": "INVALID_CREDENTIALS",
        "EMAIL_ALREADY_EXISTS": "EMAIL_ALREADY_EXISTS",
        "EMAIL_IS_ALREADY_IN_USE": "EMAIL_ALREADY_EXISTS",
        "PHONE_ALREADY_EXISTS": "PHONE_ALREADY_EXISTS",
        "PHONE_IS_ALREADY_IN_USE": "PHONE_ALREADY_EXISTS",
        "UNAUTHORIZED": "UNAUTHORIZED",
        "YOU_MUST_BE_LOGGED_IN": "UNAUTHORIZED",
        "FORBIDDEN": "FORBIDDEN",
        "ACCESS_DENIED": "FORBIDDEN",
        "USER_NOT_FOUND": "USER_NOT_FOUND",
        "VALIDATION_FAILED": "VALIDATION_FAILED",
        "VALIDATION_ERROR": "VALIDATION_FAILED",
        "TERMS_NOT_ACCEPTED": "TERMS_NOT_ACCEPTED",
        "EMAIL_NOT_VERIFIED": "EMAIL_NOT_VERIFIED",
        "EMAIL_IS_NOT_VERIFIED": "EMAIL_NOT_VERIFIED",

        // Tokens
        "INVALID_TOKEN": "INVALID_TOKEN",
        "TOKEN_EXPIRED": "TOKEN_EXPIRED",
        "TOKEN_INVALID": "INVALID_TOKEN",
        "INVALID_OR_EXPIRED_TOKEN": "INVALID_TOKEN",
        "INVALID_OR_EXPIRED_VERIFICATION_TOKEN": "INVALID_TOKEN",
        "INVALID_OR_EXPIRED_RESET_TOKEN": "INVALID_TOKEN",
        "TOKEN_EXPIRED_OR_INVALID": "INVALID_TOKEN",
        "TOKEN_REQUIRED": "INVALID_TOKEN",

        // Resend / Email Sending
        "RESEND_EMAIL_ERROR": "RESEND_EMAIL_ERROR",
        "EMAIL_SEND_FAILED": "RESEND_EMAIL_ERROR",
        "FAILED_TO_SEND_VERIFICATION_EMAIL": "RESEND_EMAIL_ERROR",
        "FAILED_TO_SEND_PASSWORD_RESET_EMAIL": "RESEND_EMAIL_ERROR",
        "RESEND_API_KEY_IS_NOT_SET": "SERVER_ERROR",

        // Passwords
        "PASSWORD_TOO_SHORT": "PASSWORD_TOO_SHORT",
        "PASSWORD_TOO_LONG": "PASSWORD_TOO_LONG",
        "PASSWORD_TOO_WEAK": "PASSWORD_TOO_WEAK",
        "PASSWORD_MISSING_UPPERCASE": "PASSWORD_MISSING_UPPERCASE",
        "PASSWORD_MISSING_LOWERCASE": "PASSWORD_MISSING_LOWERCASE",
        "PASSWORD_MISSING_NUMBER": "PASSWORD_MISSING_NUMBER",
        "PASSWORD_MISSING_SPECIAL": "PASSWORD_MISSING_SPECIAL",
        "PASSWORDS_DO_NOT_MATCH": "PASSWORDS_DO_NOT_MATCH",
        "PASSWORDS_REQUIRED": "PASSWORDS_REQUIRED",
        "CURRENT_PASSWORD_INCORRECT": "CURRENT_PASSWORD_INCORRECT",
        "NEW_PASSWORD_SAME_AS_CURRENT": "NEW_PASSWORD_SAME_AS_CURRENT",

        // Input Fields
        "INVALID_EMAIL": "INVALID_EMAIL",
        "INVALID_PHONE": "INVALID_PHONE",
        "NAME_TOO_SHORT": "NAME_TOO_SHORT",
        "NAME_TOO_LONG": "NAME_TOO_LONG",
        "NAME_INVALID": "NAME_INVALID",
        "FILL_ALL": "FILL_ALL",

        // Places
        "PLACE_NOT_FOUND": "PLACE_NOT_FOUND",
        "PLACE_ALREADY_GONE": "PLACE_ALREADY_GONE",
        "PLACE_CREATE_FAILED": "PLACE_CREATE_FAILED",
        "PLACE_UPDATE_FAILED": "PLACE_UPDATE_FAILED",
        "PLACE_DELETE_FAILED": "PLACE_DELETE_FAILED",
        "SLUG_EN_ALREADY_EXISTS": "SLUG_EN_ALREADY_EXISTS",
        "SLUG_HE_ALREADY_EXISTS": "SLUG_HE_ALREADY_EXISTS",
        "SLUG_AR_ALREADY_EXISTS": "SLUG_AR_ALREADY_EXISTS",

        // Network / Generic
        "NETWORK_ERROR": "NETWORK_ERROR",
        "FAILED_TO_FETCH": "NETWORK_ERROR",
        "NETWORK_ERROR_PLEASE_TRY_AGAIN": "NETWORK_ERROR",
        "SERVER_ERROR": "SERVER_ERROR",
        "INTERNAL_SERVER_ERROR": "SERVER_ERROR",
        "NOT_FOUND": "NOT_FOUND",
        "UNKNOWN_ERROR": "UNKNOWN_ERROR",
    };

    // Detect language from dict properties to make accurate localization decisions
    const lang = dict?.lang || (dict?.discover === 'גלה' ? 'he' : dict?.discover === 'استكشف' ? 'ar' : 'en');

    // Resolve a single code or friendly phrase: returns localized translation or null
    function resolveCode(rawInput: any): string | null {
        if (!rawInput || typeof rawInput !== 'string') return null;

        // 1. Check direct match first
        const trimmed = rawInput.trim();
        if (dict?.errors?.[trimmed]) return dict.errors[trimmed];
        if (BUILTIN[trimmed]) return BUILTIN[trimmed];

        // 2. Normalize and check mapping table
        const normalized = trimmed
            .replace(/[^a-zA-Z0-9\s-_]/g, '') // strip special punctuation
            .replace(/[\s-]/g, '_')          // convert spaces and hyphens to underscores
            .replace(/_+/g, '_')             // dedup multiple underscores
            .toUpperCase();

        const mappedCode = STRING_TO_CODE[normalized];
        if (mappedCode) {
            return dict?.errors?.[mappedCode] || BUILTIN[mappedCode] || null;
        }

        // 3. Check normalized name directly in dict and builtin
        if (dict?.errors?.[normalized]) return dict.errors[normalized];
        if (BUILTIN[normalized]) return BUILTIN[normalized];

        return null;
    }

    // --- STEP 1: Process errorCode direct values ---
    if (data.errorCode) {
        const resolved = resolveCode(data.errorCode);
        if (resolved) return resolved;
    }

    // --- STEP 2: Process direct error string ---
    if (data.error && typeof data.error === "string") {
        const resolved = resolveCode(data.error);
        if (resolved) return resolved;
    }

    // --- STEP 3: Process Zod issues array ---
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const zodCode = data.errors[0]?.message;
        const resolved = resolveCode(zodCode);
        if (resolved) return resolved;
    }

    // --- STEP 4: Process plain message string ---
    if (data.message && typeof data.message === "string") {
        const resolved = resolveCode(data.message);
        if (resolved) return resolved;

        // If it's a friendly non-technical English sentence, we can show it to English users.
        // For Hebrew/Arabic users, showing English text or raw codes is unprofessional.
        // If the string contains underscores/hyphens or has all uppercase letters, it's definitely a raw code.
        const isTechnicalCode = /^[A-Z0-9_-]+$/.test(data.message);
        if (lang === 'en' && !isTechnicalCode) {
            return data.message;
        }
    }

    // --- STEP 5: Ultimate localized fallback ---
    return dict?.errors?.UNKNOWN_ERROR || BUILTIN.UNKNOWN_ERROR;
}
