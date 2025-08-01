import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-gray-700 mb-2",
      className
    )}
    {...props}
  />
))

Label.displayName = "Label"

export default Label