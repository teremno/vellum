import { InvoiceStatus, INVOICE_STATUS_LABELS, STATUS_COLORS } from "@/lib/idl";

interface StatusBadgeProps {
  status: InvoiceStatus;
  size?: "sm" | "md" | "lg";
}

const STATUS_DOTS: Record<InvoiceStatus, string> = {
  Draft: "bg-gray-400",
  Pending: "bg-yellow-400",
  Paid: "bg-green-400",
  Overdue: "bg-red-400",
  Disputed: "bg-orange-400",
};

const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const label = INVOICE_STATUS_LABELS[status];
  const colorClass = STATUS_COLORS[status];
  const dotClass = STATUS_DOTS[status];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}