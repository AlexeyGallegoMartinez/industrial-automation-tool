import { useSelector } from "react-redux";
import { getSocketUrl } from "../services/socketClient";

export default function SettingsPage() {
  const selectedArea = useSelector((state) => state.settings.selectedArea);
  const refreshMode = useSelector((state) => state.settings.telemetryRefreshMode);
  const plcConnection = useSelector((state) => state.plc.connection);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5">
        <p className="text-sm font-medium uppercase tracking-normal text-cyan-300">
          Settings
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Runtime Config</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Socket URL</p>
          <p className="mt-2 break-all text-lg font-semibold text-white">
            {getSocketUrl()}
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Selected Area</p>
          <p className="mt-2 text-lg font-semibold text-white">{selectedArea}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">PLC Host</p>
          <p className="mt-2 break-all text-lg font-semibold text-white">
            {plcConnection.host || "not connected"}
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Polling Mode</p>
          <p className="mt-2 text-lg font-semibold capitalize text-white">
            {refreshMode} | {plcConnection.pollRateMs} ms
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">Future Layouts</p>
          <p className="mt-2 text-sm text-zinc-300">
            @dnd-kit/react is installed and reserved for draggable dashboard
            layout editing after the PLC data flow is stable.
          </p>
        </div>
      </div>
    </section>
  );
}
