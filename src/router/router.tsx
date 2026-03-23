import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ComponentsPage from "@/pages/ComponentsPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import OAuthCallbackPage from "@/pages/auth/OAuthCallbackPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
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
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/auth/callback",
    element: <OAuthCallbackPage />,
  },
]);
