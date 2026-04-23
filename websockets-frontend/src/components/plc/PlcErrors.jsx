import { useDispatch, useSelector } from "react-redux";
import { clearPlcErrors } from "../../store/plcSlice";
import { formatTimestamp } from "../../utils/formatters";

export default function PlcErrors() {
  const dispatch = useDispatch();
  const errors = useSelector((state) => state.plc.errors);

  if (errors.length === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-rose-400/30 bg-rose-400/10 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-rose-200">
            PLC errors
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Latest request issues
          </h3>
        </div>
        <button
          className="rounded-md border border-rose-300/40 px-3 py-1.5 text-xs font-semibold text-rose-100"
          onClick={() => dispatch(clearPlcErrors())}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {errors.map((error) => (
          <div
            className="rounded-md border border-rose-300/20 bg-zinc-950/60 p-3 text-sm"
            key={`${error.timestamp}-${error.detail}`}
          >
            <p className="font-semibold text-rose-100">{error.message}</p>
            <p className="mt-1 text-zinc-300">{error.detail}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatTimestamp(error.timestamp)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
