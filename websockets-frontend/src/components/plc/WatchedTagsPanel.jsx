import { useDispatch, useSelector } from "react-redux";
import { SOCKET_EVENTS } from "../../services/socketEvents";
import { emitWithAck } from "../../services/socketClient";
import {
  addPlcError,
  setSelectedTag,
  setWatchedTags,
} from "../../store/plcSlice";
import { formatTimestamp } from "../../utils/formatters";

function formatValue(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  if (typeof value === "boolean") {
    return value ? "True" : "False";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export default function WatchedTagsPanel() {
  const dispatch = useDispatch();
  const watchedTags = useSelector((state) => state.plc.watchedTags);
  const valuesById = useSelector((state) => state.plc.valuesById);
  const selectedTagId = useSelector((state) => state.plc.selectedTagId);

  async function unwatchTag(tag) {
    try {
      const response = await emitWithAck(SOCKET_EVENTS.plcUnsubscribeTags, {
        tags: [tag],
      });

      dispatch(setWatchedTags(response.snapshot));
    } catch (error) {
      dispatch(
        addPlcError({
          message: "Unable to unwatch tag.",
          detail: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 p-5">
        <p className="text-sm font-medium uppercase tracking-normal text-emerald-300">
          Live values
        </p>
        <h3 className="mt-1 text-xl font-semibold text-white">
          Watched PLC tags
        </h3>
      </div>

      <div className="max-h-[420px] overflow-auto">
        {watchedTags.length === 0 ? (
          <p className="p-5 text-sm text-zinc-400">
            Browse the PLC and choose tags to watch.
          </p>
        ) : (
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-zinc-950 text-xs uppercase tracking-normal text-zinc-400">
              <tr>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {watchedTags.map((tag) => {
                const liveValue = valuesById[tag.id];
                const isSelected = selectedTagId === tag.id;

                return (
                  <tr
                    key={tag.id}
                    className={`border-t border-zinc-800 ${
                      isSelected ? "bg-cyan-400/10" : "hover:bg-zinc-800/40"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        className="text-left font-medium text-white hover:text-cyan-200"
                        onClick={() => dispatch(setSelectedTag({ tagId: tag.id }))}
                        type="button"
                      >
                        {tag.program ? `Program:${tag.program}.` : ""}
                        {tag.name}
                      </button>
                    </td>
                    <td className="max-w-[280px] truncate px-4 py-3 font-semibold text-zinc-100">
                      {formatValue(liveValue?.value)}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {liveValue?.quality || "pending"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {formatTimestamp(liveValue?.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-rose-300 hover:text-rose-100"
                        onClick={() => unwatchTag(tag)}
                        type="button"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
