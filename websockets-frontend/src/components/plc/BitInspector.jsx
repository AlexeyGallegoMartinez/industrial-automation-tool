import { useSelector } from "react-redux";

export default function BitInspector() {
  const selectedTagId = useSelector((state) => state.plc.selectedTagId);
  const value = useSelector((state) =>
    selectedTagId ? state.plc.valuesById[selectedTagId] : null,
  );

  const bits = value?.bits || [];

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm font-medium uppercase tracking-normal text-amber-300">
        Bit inspector
      </p>
      <h3 className="mt-1 text-xl font-semibold text-white">
        Register bit values
      </h3>
      <p className="mt-2 text-sm text-zinc-400">
        Select a watched integer tag to see its 32-bit breakdown.
      </p>

      {bits.length === 0 ? (
        <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
          No integer bit data available for the selected tag.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8 lg:grid-cols-16">
          {bits.map((bit) => (
            <div
              key={bit.bit}
              className={`rounded-md border p-2 text-center ${
                bit.value
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-500"
              }`}
            >
              <p className="text-xs">Bit {bit.bit}</p>
              <p className="mt-1 text-sm font-semibold">{bit.value ? "1" : "0"}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
