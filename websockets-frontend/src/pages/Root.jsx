import { Outlet } from "react-router-dom";
import { useSocketConnection } from "../hooks/useSocketConnection";

export default function RootLayout() {
  useSocketConnection();

  return <Outlet />;
}
