"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

// Kapatma butonu bileşeni
const PopoverClose = PopoverPrimitive.Close;

const PopoverContent = React.forwardRef(
  (
    {
      className,
      align = "center",
      sideOffset = 4,
      showCloseButton = false,
      closeButtonClassName = "",
      withArrow = false,
      arrowClassName = "",
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none transition-opacity duration-200",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "relative",
          className
        )}
        {...props}
      >
        {props.children}

        {showCloseButton && (
          <PopoverClose
            className={cn(
              "absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors",
              closeButtonClassName
            )}
            aria-label="Kapat"
          >
            <X size={14} />
          </PopoverClose>
        )}

        {withArrow && (
          <PopoverPrimitive.Arrow
            className={cn("fill-popover", arrowClassName)}
            width={12}
            height={6}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
