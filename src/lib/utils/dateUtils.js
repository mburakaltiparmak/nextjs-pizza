/**
 * Date Utility Functions
 * Centralized date formatting for the application
 */

/**
 * Format date to Turkish locale
 * @param {string|Date} dateString - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return "-";

    const defaultOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        ...options
    };

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";
        return date.toLocaleDateString("tr-TR", defaultOptions);
    } catch (error) {
        console.error("Date formatting error:", error);
        return "-";
    }
};

/**
 * Format date for display (short format - no time)
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatDateShort = (dateString) => {
    return formatDate(dateString, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string (DD/MM/YYYY HH:MM)
 */
export const formatDateTime = (dateString) => {
    return formatDate(dateString); // Uses default with time
};

/**
 * Get relative time (e.g., "2 saat önce")
 * @param {string|Date} dateString - Date to format
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";

        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Az önce";
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;

        return formatDateShort(dateString);
    } catch (error) {
        console.error("Relative time error:", error);
        return "-";
    }
};

/**
 * Check if date is today
 * @param {string|Date} dateString - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
    if (!dateString) return false;

    try {
        const date = new Date(dateString);
        const today = new Date();

        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    } catch (error) {
        return false;
    }
};

/**
 * Format date for last login display
 * @param {string|Date} dateString - Last login date
 * @returns {string} Formatted string
 */
export const formatLastLogin = (dateString) => {
    if (!dateString) return "Hiç giriş yapmadı";

    if (isToday(dateString)) {
        return `Bugün ${formatDate(dateString, { hour: "2-digit", minute: "2-digit" })}`;
    }

    return formatDateTime(dateString);
};
