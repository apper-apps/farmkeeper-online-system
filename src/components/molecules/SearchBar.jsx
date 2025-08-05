import React from "react"
import Input from "@/components/atoms/Input"
import ApperIcon from "@/components/ApperIcon"

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className 
}) => {
  return (
    <div className={`relative ${className || ""}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" size={20} className="text-gray-400" />
      </div>
<Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

export default SearchBar