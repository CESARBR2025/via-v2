export function getBadgeStyles(estatus?: string | null) {
  switch ((estatus ?? "").toUpperCase()) {
    case "PAGADA":
      return { bg: "bg-green-50", text: "text-green-800" };
    case "PENDIENTE":
    case "PROCESO":
      return { bg: "bg-amber-50", text: "text-amber-800" };
    default:
      return { bg: "bg-red-50", text: "text-red-800" };
  }
}
