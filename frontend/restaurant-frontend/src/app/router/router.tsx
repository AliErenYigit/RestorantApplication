import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { HomePage } from "../../pages/HomePage";
import { MenuPage } from "../../pages/MenuPage";
import { AdminDashboardPage } from "../../pages/admin/AdminDashboardPage";
import { AdminMenuPage } from "../../pages/admin/AdminMenuPage";
import { AdminContentPage } from "../../pages/admin/AdminContentPage";
import { AdminMembersPage } from "../../pages/admin/AdminMembersPage";
import { AdminCommentsPage } from "../../pages/admin/AdminCommentsPage";
import { AdminCategoryPage } from "../../pages/admin/AdminCategoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "menu", element: <MenuPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "menu", element: <AdminMenuPage /> },
      { path: "content", element: <AdminContentPage /> },
      { path: "members", element: <AdminMembersPage /> },
      { path: "comments", element: <AdminCommentsPage /> },
      { path: "categories",element: <AdminCategoryPage />,
}
    ],
  },
]);