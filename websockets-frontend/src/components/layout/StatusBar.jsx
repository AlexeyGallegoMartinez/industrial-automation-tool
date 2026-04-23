import { useSelector } from "react-redux";
import ConnectionBadge from "../realtime/ConnectionBadge";
import { formatTimestamp } from "../../utils/formatters";

export default function StatusBar() {
  const { lastHeartbeatAt, socketId } = useSelector((state) => state.connection);
  const watchedTagCount = useSelector(
    (state) => state.plc.connection.watchedTagCount,
  );
  const plcStatus = useSelector((state) => state.plc.connection.status);

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <ConnectionBadge />
          <span>Socket ID: {socketId || "not connected"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span>PLC: {plcStatus}</span>
          <span>Watched tags: {watchedTagCount.toLocaleString()}</span>
          <span>Last packet: {formatTimestamp(lastHeartbeatAt)}</span>
        </div>
      </div>
    </footer>
  );
}
