export function getErrorMessage(data: any, dict: any): string {
    if (!data) return dict?.errors?.UNKNOWN_ERROR || "Something went wrong. Please try again.";

    // Built-in English fallbacks for every known error code.
    // These fire when dict.errors is missing (e.g. statically cached pages).
    const BUILTIN: Record<string, string> = {
        // Auth
        INVALID_CREDENTIALS: "Invalid email or password.",
        EMAIL_ALREADY_EXISTS: "Email is already in use.",
        UNAUTHORIZED: "You must be logged in.",
        FORBIDDEN: "You do not have permission to do this.",
        USER_NOT_FOUND: "User not found.",
        VALIDATION_FAILED: "Validation failed.",

        // Password
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

        // User fields
        INVALID_EMAIL: "Invalid email address.",
        INVALID_PHONE: "Invalid phone number.",
        NAME_TOO_SHORT: "Name must be at least 2 characters.",
        NAME_TOO_LONG: "Name cannot exceed 50 characters.",
        NAME_INVALID: "Name must be between 2 and 50 characters.",
        FILL_ALL: "Please fill in all required fields.",

        // Profile
        PROFILE_UPDATE_FAILED: "Failed to update profile.",

        // Avatar / upload
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

        // Places
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

    // Resolve a single code: prefer dict translation, then built-in English
    function resolveCode(code: string): string | null {
        if (!code) return null;
        return dict?.errors?.[code] || BUILTIN[code] || null;
    }

    // 1. Direct errorCode on response (new API shape: { success: false, errorCode, field })
    if (data.errorCode) {
        return resolveCode(data.errorCode) || data.errorCode;
    }

    // 2. Legacy: issues array from Zod
    if (Array.isArray(data.errors) && data.errors.length > 0) {
        const zodCode = data.errors[0]?.message;
        return resolveCode(zodCode) || dict?.errors?.VALIDATION_FAILED || "Validation failed.";
    }

    // 3. Fallback for legacy plain message strings
    if (data.message && typeof data.message === "string") {
        return data.message;
    }

    // 4. Ultimate fallback
    return dict?.errors?.UNKNOWN_ERROR || "Something went wrong. Please try again.";
}
