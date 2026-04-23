import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SOCKET_EVENTS } from "../../services/socketEvents";
import { emitWithAck } from "../../services/socketClient";
import {
  addPlcError,
  setSelectedScope,
  setSelectedTag,
  setTagSearch,
  setWatchedTags,
} from "../../store/plcSlice";

export default function TagBrowser() {
  const dispatch = useDispatch();
  const browser = useSelector((state) => state.plc.browser);
  const watchedTags = useSelector((state) => state.plc.watchedTags);
  const watchedIds = useMemo(
    () => new Set(watchedTags.map((tag) => tag.id)),
    [watchedTags],
  );

  const filteredTags = useMemo(() => {
    const search = browser.search.trim().toLowerCase();

    return browser.tags
      .filter((tag) => {
        if (browser.selectedScope === "controller") {
          return tag.scope === "controller";
        }

        if (browser.selectedScope === "program") {
          return tag.scope === "program";
        }

        return true;
      })
      .filter((tag) => {
        if (!search) {
          return true;
        }

        return `${tag.name} ${tag.program || ""} ${tag.dataType}`
          .toLowerCase()
          .includes(search);
      });
  }, [browser.search, browser.selectedScope, browser.tags]);

  async function watchTag(tag) {
    try {
      const response = await emitWithAck(SOCKET_EVENTS.plcSubscribeTags, {
        tags: [tag],
      });

      dispatch(setWatchedTags(response.snapshot));
      dispatch(setSelectedTag({ tagId: tag.id }));
    } catch (error) {
      dispatch(
        addPlcError({
          message: "Unable to watch tag.",
          detail: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900">
      <div className="border-b border-zinc-800 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-normal text-cyan-300">
              Tag browser
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              Controller and program scoped tags
            </h3>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="min-h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
              onChange={(event) =>
                dispatch(setTagSearch({ search: event.target.value }))
              }
              placeholder="Search tags"
              type="search"
              value={browser.search}
            />
            <select
              className="min-h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-cyan-400"
              onChange={(event) =>
                dispatch(setSelectedScope({ scope: event.target.value }))
              }
              value={browser.selectedScope}
            >
              <option value="all">All scopes</option>
              <option value="controller">Controller scope</option>
              <option value="program">Program scope</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          Found {browser.tags.length.toLocaleString()} tags. Showing{" "}
          {filteredTags.length.toLocaleString()}.
        </p>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-zinc-950 text-xs uppercase tracking-normal text-zinc-400">
            <tr>
              <th className="px-4 py-3">Tag</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Program</th>
              <th className="px-4 py-3">Data Type</th>
              <th className="px-4 py-3">Array</th>
              <th className="px-4 py-3">Read</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map((tag) => {
              const isWatched = watchedIds.has(tag.id);
              const isReadable = tag.readable && !tag.isStructure;

              return (
                <tr
                  key={tag.id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <button
                      className="text-left hover:text-cyan-200"
                      onClick={() => dispatch(setSelectedTag({ tagId: tag.id }))}
                      type="button"
                    >
                      {tag.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{tag.scope}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {tag.program || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {tag.dataType}
                    {tag.isStructure ? (
                      <span className="ml-2 rounded-md border border-amber-400/30 px-2 py-0.5 text-xs text-amber-200">
                        structure
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {tag.arrayDims > 0 ? `${tag.arrayDims}D` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-md border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:border-cyan-300 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-500"
                      disabled={!isReadable || isWatched}
                      onClick={() => watchTag(tag)}
                      type="button"
                    >
                      {isWatched ? "Watching" : "Watch"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
