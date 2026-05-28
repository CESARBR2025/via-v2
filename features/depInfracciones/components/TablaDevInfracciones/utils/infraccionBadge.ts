export function getBadgeStyles(estatus: string) {
  switch (estatus.toUpperCase()) {
    case "PAGADA":
      return { bg: "bg-[#EAF8F1]", text: "text-[#1F7A4D]" };
    case "PENDIENTE":
    case "PROCESO":
      return { bg: "bg-[#FFF4E8]", text: "text-[#B76A1E]" };
    default:
      return { bg: "bg-[#FFF0F0]", text: "text-[#B54747]" };
  }
}
