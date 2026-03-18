import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ComponentsPage from "@/pages/ComponentsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "components", element: <ComponentsPage /> },
      // { index: true, element: <HomePage /> },
      // { path: "invest", element: <InvestPage /> },
      // { path: "account", element: <AccountPage /> },
      // { path: "trade", element: <TradePage /> },
      // { path: "users", element: <UsersPage /> },
      // { path: "alarm", element: <AlarmPage /> },
      // { path: "mentor", element: <MentorPage /> },
      // { path: "mentee", element: <MenteePage /> },
      // { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
