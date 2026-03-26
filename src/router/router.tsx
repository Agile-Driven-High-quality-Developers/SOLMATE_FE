import { createBrowserRouter } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import SignUpPage from "@/pages/auth/SignUpPage";
import OAuthCallbackPage from "@/pages/auth/OauthCallbackPage";
import StockList from "@/pages/stocks/StockList";
import StockDetailPage from "@/pages/stocks/[stockId]/StockDetailPage";
import ProtectedRoute from "./ProtectedRoute";
import TradeDiaryPage from "@/pages/trade-diaries/TradeDiaryPage";
import DiaryDetailPage from "@/pages/trade-diaries/[tradeDiaryId]/DiaryDetailPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import UserListPage from "@/pages/user-list/userListPage";
import AccountPage from "@/pages/account/AccountPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "invest",
            children: [
              { index: true, element: <StockList /> },
              { path: ":stockCode", element: <StockDetailPage /> },
            ],
          },
          { path: "account", element: <AccountPage /> },
          { path: "profile", element: <ProfilePage /> },
          {
            path: "trade-diary",
            children: [
              { index: true, element: <TradeDiaryPage /> },
              { path: ":tradeDiaryId", element: <DiaryDetailPage /> },
            ],
          },
          { path: "users", element: <UserListPage /> },
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
