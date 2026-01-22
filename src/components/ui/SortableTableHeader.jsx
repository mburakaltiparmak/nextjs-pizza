/**
 * SortableTableHeader Component
 * Reusable sortable table header with sort indicators
 */

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export const SortableTableHeader = ({
    field,
    label,
    currentSortField,
    sortDirection,
    onSort,
    className = "",
    align = "left"
}) => {
    const isActive = currentSortField === field;

    const SortIcon = () => {
        if (!isActive) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
        }
        return sortDirection === "asc" ? (
            <ArrowUp className="w-4 h-4 text-blue-600" />
        ) : (
            <ArrowDown className="w-4 h-4 text-blue-600" />
        );
    };

    const alignClass = {
        left: "text-left",
        center: "text-center",
        right: "text-right"
    }[align];

    return (
        <th
            className={`px-6 py-4 ${alignClass} text-sm font-bold text-darkgray font-Barlow cursor-pointer hover:bg-lightgray/70 transition-colors whitespace-nowrap ${className}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center gap-2 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
                {label}
                <SortIcon />
            </div>
        </th>
    );
};

/**
 * Usage Example:
 * 
 * const { sortedData, sortField, sortDirection, handleSort } = useTableSort(orders);
 * 
 * <table>
 *   <thead>
 *     <tr>
 *       <SortableTableHeader
 *         field="id"
 *         label="Sipariş No"
 *         currentSortField={sortField}
 *         sortDirection={sortDirection}
 *         onSort={handleSort}
 *       />
 *       <SortableTableHeader
 *         field="orderDate"
 *         label="Tarih"
 *         currentSortField={sortField}
 *         sortDirection={sortDirection}
 *         onSort={handleSort}
 *       />
 *       <SortableTableHeader
 *         field="totalAmount"
 *         label="Toplam"
 *         currentSortField={sortField}
 *         sortDirection={sortDirection}
 *         onSort={handleSort}
 *         align="right"
 *       />
 *     </tr>
 *   </thead>
 *   <tbody>
 *     {sortedData.map(order => <OrderRow key={order.id} order={order} />)}
 *   </tbody>
 * </table>
 */
