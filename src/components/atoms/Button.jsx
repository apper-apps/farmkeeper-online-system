import React, { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-primary-500",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-400 hover:from-secondary-600 hover:to-secondary-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-secondary-500",
    outline: "border-2 border-primary-500 bg-transparent text-primary-700 hover:bg-primary-50 hover:shadow-md focus:ring-primary-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
    danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-red-500"
  }
  
  const sizes = {
    sm: "text-sm px-3 py-2 gap-2",
    md: "text-base px-4 py-2 gap-2",
    lg: "text-lg px-6 py-3 gap-3",
    xl: "text-xl px-8 py-4 gap-3"
  }
  
  const iconSize = {
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22
  }
  
  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          size={iconSize[size]} 
          className="animate-spin" 
        />
      )}
      {!loading && icon && iconPosition === "left" && (
        <ApperIcon name={icon} size={iconSize[size]} />
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <ApperIcon name={icon} size={iconSize[size]} />
      )}
    </button>
  )
})

Button.displayName = "Button"

export default Button