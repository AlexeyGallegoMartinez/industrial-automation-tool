import { useSelector } from "react-redux";

export default function ProgramList() {
  const programs = useSelector((state) => state.plc.browser.programs);
  const tags = useSelector((state) => state.plc.browser.tags);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm font-medium uppercase tracking-normal text-cyan-300">
        PLC programs
      </p>
      <h3 className="mt-1 text-xl font-semibold text-white">
        Program names from the controller tag list
      </h3>
      <p className="mt-2 text-sm text-zinc-400">
        This shows program names and program-scoped tags exposed by Ethernet/IP.
        It does not extract the PLC source code or ladder routines.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {programs.length === 0 ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
            Browse the PLC to load program names.
          </div>
        ) : (
          programs.map((program) => {
            const tagCount = tags.filter((tag) => tag.program === program).length;

            return (
              <div
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                key={program}
              >
                <p className="font-semibold text-white">{program}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {tagCount.toLocaleString()} program scoped tags
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
