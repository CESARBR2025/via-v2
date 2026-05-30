export function getBadgeStyles(estatus: string) {
  switch (estatus.toUpperCase()) {
    case "PAGADA":
      return { bg: "bg-[#DCFCE7]", text: "text-[#16A34A]" };
    case "PENDIENTE":
    case "PROCESO":
      return { bg: "bg-[#FEF3C7]", text: "text-[#D97706]" };
    default:
      return { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]" };
  }
}
