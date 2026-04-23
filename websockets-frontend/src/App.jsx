import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import RootLayout from "./pages/Root";
import DashboardRootLayout from "./pages/DashboardRoot";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";
import ErrorPage from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate replace to="/dashboard" /> },
      {
        path: "dashboard",
        element: <DashboardRootLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
