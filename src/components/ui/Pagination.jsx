import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable Pagination Component
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (0-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Callback when a page is selected
 * @param {string} props.className - Additional class names
 */
export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className
}) => {
    if (totalPages <= 1) return null;

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        // Always show first page
        pages.push(0);

        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages - 2, currentPage + 1);

        // Adjust logic if near start or end
        if (currentPage <= 2) {
            endPage = Math.min(totalPages - 2, 3);
        } else if (currentPage >= totalPages - 3) {
            startPage = Math.max(1, totalPages - 4);
        }

        // Add dots if gap from start
        if (startPage > 1) {
            pages.push('...');
        }

        // Add middle pages
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Add dots if gap to end
        if (endPage < totalPages - 2) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={cn("flex items-center justify-center gap-2 my-8", className)}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-lightgray bg-white text-darkgray disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lightgray/10 transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft size={20} />
            </button>

            {pageNumbers.map((page, index) => {
                if (page === '...') {
                    return (
                        <span key={`dots-${index}`} className="px-2 text-darkgray">
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "w-10 h-10 rounded-lg font-Barlow font-semibold transition-all duration-300",
                            currentPage === page
                                ? "bg-yellow text-red border border-yellow"
                                : "bg-white text-darkgray border border-lightgray hover:bg-lightgray/10"
                        )}
                    >
                        {page + 1}
                    </button>
                );
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg border border-lightgray bg-white text-darkgray disabled:opacity-50 disabled:cursor-not-allowed hover:bg-lightgray/10 transition-colors"
                aria-label="Next page"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};
