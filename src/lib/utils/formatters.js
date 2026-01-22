/**
 * Formatter Utility Functions
 * Centralized formatting functions for the application
 */

/**
 * Get category name by ID
 * @param {number|string} categoryId - Category ID
 * @param {Array} categories - Categories array
 * @returns {string} Category name
 */
export const getCategoryName = (categoryId, categories) => {
    if (!categoryId) return "Bilinmeyen Kategori";

    const categoryIdStr = categoryId.toString();

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return "Kategoriler yükleniyor...";
    }

    const foundCategory = categories.find(
        (cat) => cat.id && cat.id.toString() === categoryIdStr
    );

    return foundCategory ? foundCategory.name : "Bilinmeyen Kategori";
};

/**
 * Format price
 * @param {number} price - Price value
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted price
 */
export const formatPrice = (price, currency = "₺") => {
    if (typeof price !== "number" || isNaN(price)) return "-";
    return `${price.toFixed(2)} ${currency}`;
};

/**
 * Format phone number to Turkish format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone (05XX XXX XX XX)
 */
export const formatPhoneNumber = (phone) => {
    if (!phone) return "-";

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Format: 05XX XXX XX XX
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
        return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return phone;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text || "";
    return `${text.substring(0, maxLength)}...`;
};

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
    if (typeof num !== "number" || isNaN(num)) return "0";
    return num.toLocaleString("tr-TR");
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format user full name
 * @param {Object} user - User object with name and surname
 * @returns {string} Full name
 */
export const formatUserFullName = (user) => {
    if (!user) return "-";
    const name = user.name || "";
    const surname = user.surname || "";
    return `${name} ${surname}`.trim() || "-";
};
