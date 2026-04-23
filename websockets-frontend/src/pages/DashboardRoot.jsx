import { Outlet } from "react-router-dom";
import DashboardNav from "../components/layout/DashboardNav";
import StatusBar from "../components/layout/StatusBar";

export default function DashboardRootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <DashboardNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <StatusBar />
    </div>
  );
}
