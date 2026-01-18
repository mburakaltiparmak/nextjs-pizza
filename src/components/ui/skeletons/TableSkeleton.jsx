import { Skeleton } from "@/components/ui/Skeleton"

export function TableSkeleton({ rowCount = 5, columnCount = 4 }) {
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="border rounded-md">
                <div className="border-b p-4 grid gap-4" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
                    {Array.from({ length: columnCount }).map((_, i) => (
                        <Skeleton key={`head-${i}`} className="h-6 w-full" />
                    ))}
                </div>
                {Array.from({ length: rowCount }).map((_, i) => (
                    <div key={`row-${i}`} className="border-b last:border-0 p-4 grid gap-4 items-center" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
                        {Array.from({ length: columnCount }).map((_, j) => (
                            <Skeleton key={`cell-${i}-${j}`} className="h-12 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}
