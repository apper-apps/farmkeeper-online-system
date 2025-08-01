import React from "react"
import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import { cn } from "@/utils/cn"

const FormField = ({ 
  label, 
  type = "input", 
  error, 
  className,
  children,
  ...props 
}) => {
  const renderField = () => {
    switch (type) {
      case "select":
        return <Select {...props}>{children}</Select>
      case "textarea":
        return <Textarea {...props} />
      default:
        return <Input type={type} {...props} />
    }
  }

  return (
    <div className={cn("form-group", className)}>
      {label && <Label>{label}</Label>}
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FormField