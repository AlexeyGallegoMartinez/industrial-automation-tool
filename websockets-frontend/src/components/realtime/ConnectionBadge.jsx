import { useSelector } from "react-redux";
import { getStatusClass } from "../../utils/formatters";

export default function ConnectionBadge() {
  const { status, reconnectAttempt } = useSelector((state) => state.connection);
  const statusText =
    status === "reconnecting"
      ? `Reconnecting ${reconnectAttempt}`
      : status.replace("-", " ");

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-semibold capitalize ${getStatusClass(status)}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {statusText}
    </span>
  );
}
