"use client";

import Image from "next/image";
import { SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CategoryTableRow = ({ category, onEdit, onDelete }) => {
    return (
        <tr className="border-b border-lightgray2 hover:bg-lightgray/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-lightgray flex items-center justify-center overflow-hidden">
                        {category.img ? <Image
                            src={category.img}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="object-cover"
                        /> : <Image
                            src="https://www.freeiconspng.com/uploads/no-image-icon-15.png"
                            alt={category.name}
                            width={48}
                            height={48}
                            className="object-cover"
                        />}

                    </div>
                    <span className="font-medium text-darkgray font-Barlow">
                        {category.name}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-gray font-Barlow">
                    {category.productCount || 0}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                        <SquarePen size={16} className="mr-1" />
                        Düzenle
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(category)}
                        className="border-red text-red hover:bg-red/10"
                    >
                        <Trash2 size={16} className="mr-1" />
                        Sil
                    </Button>
                </div>
            </td>
        </tr>
    );
};
