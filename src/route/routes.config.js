import React from "react";
import { MainLayout } from "../components/Common/MainLayout/mainlayout";
import { AuthenticationLayout } from "../components/Common/AuthLayout/AuthenticationLayout";
import { SignUpContent } from "../components/Authentication/SignUpContent";
import { SignInContent } from "../components/Authentication/SignInContent";
import { LockScreenContent } from "../components/Authentication/LockScreenContent";
import { LogOutContent } from "../components/Authentication/LogOutContent";
import { PasswordChangeContent } from "../components/Authentication/PasswordChangeContent";
import { PasswordResetContent } from "../components/Authentication/PasswordResetContent";
import { SuccessMsgContent } from "../components/Authentication/SuccessMsgContent";
import { ErrorPageContent } from "../components/Authentication/ErrorPageContent";
import { ErrorPageContentOne } from "../components/Authentication/ErrorPageContentOne";
import { TwoStepAuthContent } from "../components/Authentication/TwoStepAuthContent";
import { OfflinePageContent } from "../components/Authentication/OfflinePageContent";
import AuthProtected from "./AuthProtected";
import PublicRoute from "./PublicRoute";
import { ProfilePage } from "../pages/profilePage";
import { ChangePassword } from "../pages/ChangePassword";
import { DashboardPage } from "../pages/dashboardPage";
import { Navigate } from "react-router-dom";
import { BlogsAdd } from "../pages/BlogsAdd";
import { BlogsManage } from "../pages/BlogsManage";
import { PageGroup } from "../pages/PageGroup";
import { PageMaster } from "../pages/PageMaster";
import { CreateRoles } from "../pages/CreateRoles";
import { ManageAccessPage } from "../pages/ManageAccess";

import { NewUser } from "../pages/NewUser";
import { NewUserView } from "../pages/NewUserView";
import { NewUserUpdate } from "../pages/NewUserUpdate";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import  {AlbumCategory} from "../pages/AlbumCategory";
import { BlogTag } from "../pages/BlogTag";
import { AlbumAdd } from "../pages/AlbumAdd";
import { AlbumManage } from "../pages/AlbumManage";
import { LandingPageAdd } from "../pages/LandingPageAdd";
import { LandingPageManage } from "../pages/LandingPageManage";
import { LandingPagesBanquetSpaceDetails} from "../pages/LandingPagesBanquetSpaceDetails";
import { LandingPagesFaq} from "../pages/LandingPagesFaq";
 import { LandingPagesGallery } from "../pages/LandingPagesGallery";

 import { LandingPageTestimonials } from "../pages/LandingPageTestimonials";
import { ContactEnquiry } from "../pages/ContactEnquiry";
import { LandingPageBanners } from "../pages/LandingPageBanners";
import { LandingPageEnquiry } from "../pages/LandingPageEnquiry";
 



const routes = [
  {
    path: "/",
    element: (
      <AuthProtected>
        <MainLayout />
      </AuthProtected>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "page-group", element: <PageGroup /> },
      { path: "page-master", element: <PageMaster /> },
      { path: "create-role", element: <CreateRoles /> },

      {
        path: "Manage-role-access/:roleId/:roleName",
        element: <ManageAccessPage />,
      },

      { path: "user", element: <NewUserView /> },

      //routing for user management
      { path: "user", element: <NewUserView /> },
      {
        path: "user",
        children: [
          { path: "add", element: <NewUser /> },
          { path: "update/:id", element: <NewUserUpdate /> },
        ],
      },

      {path:"landing-pages",element:<LandingPageManage/>},

{
  path: "landing-pages",
  children: [
    {
      path: "add",
      element: <LandingPageAdd />,
    },
    {
      path: "update/:id",
      element: <LandingPageAdd />,
    },
    {
      path: ":lpGuid/faqs",
      element: <LandingPagesFaq />,
    },
    {
      path: ":lpGuid/testimonials",
      element: <LandingPageTestimonials />,
    },
    {
      path: ":lpGuid/gallery",
      element: <LandingPagesGallery />,
    },
    {
      path: ":lpGuid/banquet-space-details",
      element: <LandingPagesBanquetSpaceDetails />,
    },
    {
      path: ":lpGuid/banners",
      element: <LandingPageBanners />,
    },
  ],
},
      //--------------------------
    {path:"contact-enquiry",element:<ContactEnquiry/>},
    {path:"landing-page-enquiry",element:<LandingPageEnquiry/>},
      { path: "dashboard", element: <DashboardPage /> },
      { path: "user-dashboard", element: <UserDashboardPage /> },
      { path: "my-profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePassword /> },
      {path:"album-category",element:<AlbumCategory/>},
      {path:"blog-tag",element:<BlogTag/>},

      {path:"albums",element:<AlbumManage/>},
      
        {path: "albums",
        children: [
          { path: "add", element: <AlbumAdd /> },
          { path: "update/:id", element: <AlbumAdd /> },
        ],
      },

    

      //routing for blog management
      { path: "blogs", element: <BlogsManage /> },
      {
        path: "blogs",
        children: [
          { path: "add", element: <BlogsAdd /> },
          { path: "update/:id", element: <BlogsAdd /> },
        ],
      },

      //------------------
    ],
  },
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <AuthenticationLayout />
      </PublicRoute>
    ),
    children: [
      { path: "signup", element: <SignUpContent /> },
      { path: "signin", element: <SignInContent /> },
      { path: "lock-screen", element: <LockScreenContent /> },
      { path: "logout", element: <LogOutContent /> },
      { path: "password-change", element: <PasswordChangeContent /> },
      { path: "password-reset", element: <PasswordResetContent /> },
      { path: "success-message", element: <SuccessMsgContent /> },
      { path: "verification", element: <TwoStepAuthContent /> },
    ],
  },

  {
    path: "/500-error-page",
    element: <ErrorPageContentOne />,
  },
  { path: "404-error-page", element: <ErrorPageContent /> },
  {
    path: "/offline",
    element: <OfflinePageContent />,
  },
];

export default routes;
