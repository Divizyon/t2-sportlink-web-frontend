import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  status: "Aktif" | "Pasif" | "Taslak"
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Pasif":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "Taslak":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <Badge 
      className={cn(
        "font-medium",
        getStatusColor(status),
        className
      )}
    >
      {status}
    </Badge>
  )
} 