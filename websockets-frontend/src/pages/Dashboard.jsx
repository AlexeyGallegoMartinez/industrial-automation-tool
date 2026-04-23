import BitInspector from "../components/plc/BitInspector";
import PlcConnectionPanel from "../components/plc/PlcConnectionPanel";
import PlcErrors from "../components/plc/PlcErrors";
import ProgramList from "../components/plc/ProgramList";
import TagBrowser from "../components/plc/TagBrowser";
import WatchedTagsPanel from "../components/plc/WatchedTagsPanel";
import ConnectionBadge from "../components/realtime/ConnectionBadge";

export default function DashboardPage() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-normal text-cyan-300">
            Single device workspace
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Rockwell PLC Tag Monitor
          </h2>
          <p className="mt-2 max-w-3xl text-zinc-400">
            Connect to one controller, browse controller and program scoped
            tags, choose tags to watch, and inspect integer register bits in
            real time over websockets.
          </p>
        </div>
        <ConnectionBadge />
      </div>

      <PlcErrors />
      <PlcConnectionPanel />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.8fr)]">
        <TagBrowser />
        <div className="flex flex-col gap-5">
          <WatchedTagsPanel />
          <BitInspector />
        </div>
      </div>

      <ProgramList />
    </section>
  );
}
