import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "PLC Workspace", icon: "M4 5h16v10H4V5Zm2 2v6h12V7H6Zm1 10h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z" },
  { to: "/dashboard/settings", label: "Settings", icon: "M11 3h2l.4 2.2c.5.2 1 .4 1.5.7l1.9-1.3 1.4 1.4-1.3 1.9c.3.5.5 1 .7 1.5L21 11v2l-2.4.4c-.2.5-.4 1-.7 1.5l1.3 1.9-1.4 1.4-1.9-1.3c-.5.3-1 .5-1.5.7L13 21h-2l-.4-2.4c-.5-.2-1-.4-1.5-.7l-1.9 1.3-1.4-1.4 1.3-1.9c-.3-.5-.5-1-.7-1.5L3 13v-2l2.4-.4c.2-.5.4-1 .7-1.5L4.8 7.2l1.4-1.4 1.9 1.3c.5-.3 1-.5 1.5-.7L11 3Zm1 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" },
];

function NavIcon({ path }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={path} />
    </svg>
  );
}

export default function DashboardNav() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/95 text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-cyan-300">
            Rockwell Ethernet/IP
          </p>
          <h1 className="text-xl font-semibold">Single PLC Tag Browser</h1>
        </div>
        <nav className="flex gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                [
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                  isActive
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-100"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600 hover:text-white",
                ].join(" ")
              }
            >
              <NavIcon path={item.icon} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
