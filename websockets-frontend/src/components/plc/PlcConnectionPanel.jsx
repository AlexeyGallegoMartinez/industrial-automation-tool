import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SOCKET_EVENTS } from "../../services/socketEvents";
import { emitWithAck } from "../../services/socketClient";
import {
  addPlcError,
  browseStarted,
  setBrowseResult,
  setPlcConnectionState,
} from "../../store/plcSlice";
import { getStatusClass } from "../../utils/formatters";

export default function PlcConnectionPanel() {
  const dispatch = useDispatch();
  const connection = useSelector((state) => state.plc.connection);
  const [host, setHost] = useState(connection.host || "192.168.1.10");
  const [slot, setSlot] = useState(connection.slot || 0);
  const [pollRateMs, setPollRateMs] = useState(connection.pollRateMs || 1000);
  const [isBusy, setIsBusy] = useState(false);

  async function handleConnect(event) {
    event.preventDefault();
    setIsBusy(true);

    try {
      const response = await emitWithAck(SOCKET_EVENTS.plcConnect, {
        host,
        slot: Number(slot),
        pollRateMs: Number(pollRateMs),
      });

      dispatch(setPlcConnectionState(response.state));
    } catch (error) {
      dispatch(
        addPlcError({
          message: "PLC connection failed.",
          detail: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDisconnect() {
    setIsBusy(true);

    try {
      const response = await emitWithAck(SOCKET_EVENTS.plcDisconnect);
      dispatch(setPlcConnectionState(response.state));
    } catch (error) {
      dispatch(
        addPlcError({
          message: "PLC disconnect failed.",
          detail: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleBrowse() {
    setIsBusy(true);
    dispatch(browseStarted());

    try {
      const response = await emitWithAck(SOCKET_EVENTS.plcBrowse, {}, 30000);
      dispatch(setBrowseResult(response.result));
    } catch (error) {
      dispatch(
        addPlcError({
          message: "PLC tag browse failed.",
          detail: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    } finally {
      setIsBusy(false);
    }
  }

  const isConnected = connection.status === "connected";

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-cyan-300">
            PLC connection
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Connect to one Rockwell PLC
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Enter the controller IP or host and slot. The backend owns the
            Ethernet/IP connection and the browser only sends websocket requests.
          </p>
        </div>
        <span
          className={`w-fit rounded-md border px-3 py-1 text-sm font-semibold capitalize ${getStatusClass(connection.status)}`}
        >
          {connection.status}
        </span>
      </div>

      <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_120px_160px_auto]" onSubmit={handleConnect}>
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          Connection string / IP
          <input
            className="min-h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-cyan-400"
            onChange={(event) => setHost(event.target.value)}
            placeholder="192.168.1.10"
            type="text"
            value={host}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          Slot
          <input
            className="min-h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-cyan-400"
            min="0"
            onChange={(event) => setSlot(event.target.value)}
            type="number"
            value={slot}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-300">
          Poll rate ms
          <input
            className="min-h-11 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-white outline-none focus:border-cyan-400"
            max="10000"
            min="250"
            onChange={(event) => setPollRateMs(event.target.value)}
            step="250"
            type="number"
            value={pollRateMs}
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            className="min-h-11 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-4 text-sm font-semibold text-cyan-100 hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isBusy}
            type="submit"
          >
            {isConnected ? "Reconnect" : "Connect"}
          </button>
          <button
            className="min-h-11 rounded-md border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isConnected || isBusy}
            onClick={handleDisconnect}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="min-h-10 rounded-md border border-emerald-400/40 bg-emerald-400/10 px-4 text-sm font-semibold text-emerald-100 hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isConnected || isBusy}
          onClick={handleBrowse}
          type="button"
        >
          Browse Tags and Programs
        </button>
        {connection.properties ? (
          <span className="text-sm text-zinc-400">
            Controller: {connection.properties.name || "unnamed"} | Version:{" "}
            {connection.properties.version || "unknown"}
          </span>
        ) : null}
      </div>
    </section>
  );
}
