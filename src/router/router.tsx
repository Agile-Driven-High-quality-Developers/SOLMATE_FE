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
import NotificationPage from "@/pages/notification/NotificationPage";
import MyMentorPage from "@/pages/mentor/MyMentorPage";
import MyMenteePage from "@/pages/mentee/MyMenteePage";
import UserProfilePage from "@/pages/users/UserProfilePage";
import GuidePage from "@/pages/guide/GuidePage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

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
          { path: "notifications", element: <NotificationPage /> },
          { path: "users/:userId", element: <UserProfilePage /> },
          { path: "mentor", element: <MyMentorPage /> },
          { path: "mentee", element: <MyMenteePage /> },
          { path: "guide", element: <GuidePage /> },
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
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
]);
