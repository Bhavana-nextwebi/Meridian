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

// Experience Pages management
import { ExperiencesManage } from "../pages/ExperiencesManage";
import { ExperiencesAdd } from "../pages/ExperiencesAdd";
import { ExperiencesServicePage } from "../pages/ExperiencesServicePage";
import { ExperienceTestimonialsPage } from "../pages/ExperienceTestimonialsPage";
import { ExperiencesEventPage } from "../pages/ExperiencesEventPage";
import { ExperiencesLightPage } from "../pages/ExperiencesLightPage";
import { ExperiencesWeddingPage } from "../pages/ExperiencesWeddingPage";
import { ExperienceCategory } from "../pages/ExperienceCategory";

import { VenueCategory } from "../pages/VenueCategory";
import { VenueSubcategory } from "../pages/VenueSubcategory";
import { VenuePageAdd } from "../pages/VenuePageAdd";
import { VenuePageManage } from "../pages/VenuePageManage";
import { VenueLawnGalleryPage } from "../pages/VenueLawnGalleryPage";
import { VenueWhyChooseFeaturesPage } from "../pages/VenueWhyChooseFeaturesPage";
import { VenueFaqPage } from "../pages/VenueFaqPage";
import { VenueOpenSkyPage } from "../pages/VenueOpenSkyPage";

// Venue Category Pages management
import { VenueCategoryPageAdd } from "../pages/VenueCategoryPageAdd";
import { VenueCategoryPageManage } from "../pages/VenueCategoryPageManage";
import { VenueCategoryGalleryPage } from "../pages/VenueCategoryGalleryPage";
import { VenueCategoryHostedPage } from "../pages/VenueCategoryHostedPage";
import { VenueCategoryDistinctivePage } from "../pages/VenueCategoryDistinctivePage";
import { VenueCategoryMomentsPage } from "../pages/VenueCategoryMomentsPage";
import { VenueCategoryWhyChoosePage } from "../pages/VenueCategoryWhyChoosePage";
import { VenueCategoryFaqPage } from "../pages/VenueCategoryFaqPage";

// Venue Subcategory Pages management
import { VenueSubcategoryPageAdd } from "../pages/VenueSubcategoryPageAdd";
import { VenueSubcategoryPageManage } from "../pages/VenueSubcategoryPageManage";
import { VenueSubcategoryCapacityPage } from "../pages/VenueSubcategoryCapacityPage";
import { VenueSubcategoryCelebrationFeaturesPage } from "../pages/VenueSubcategoryCelebrationFeaturesPage";
import { VenueSubcategoryFaqPage } from "../pages/VenueSubcategoryFaqPage";
import { VenueSubcategoryIntroFeaturesPage } from "../pages/VenueSubcategoryIntroFeaturesPage";
import { VenueSubcategoryMomentsPage } from "../pages/VenueSubcategoryMomentsPage";
import { VenueSubcategoryWhyChoosePage } from "../pages/VenueSubcategoryWhyChoosePage";



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

      // Experience Pages
      { path: "experience-pages", element: <ExperiencesManage /> },
      {
        path: "experience-pages",
        children: [
          { path: "add", element: <ExperiencesAdd /> },
          { path: "update/:id", element: <ExperiencesAdd /> },
          { path: ":experienceGuid/services", element: <ExperiencesServicePage /> },
          { path: ":experienceGuid/testimonials", element: <ExperienceTestimonialsPage /> },
          { path: ":experienceGuid/events", element: <ExperiencesEventPage /> },
          { path: ":experienceGuid/light", element: <ExperiencesLightPage /> },
          { path: ":experienceGuid/wedding", element: <ExperiencesWeddingPage /> },
        ],
      },
    {path:"venue-pages",element:<VenuePageManage/>},
    {
      path: "venue-pages",
      children: [
        { path: "add", element: <VenuePageAdd /> },
        { path: "update/:id", element: <VenuePageAdd /> },
        { path: ":venueGuid/gallery", element: <VenueLawnGalleryPage /> },
        { path: ":venueGuid/why-choose-us", element: <VenueWhyChooseFeaturesPage /> },
        { path: ":venueGuid/faqs", element: <VenueFaqPage /> },
        { path: ":venueGuid/open-sky", element: <VenueOpenSkyPage /> },
      ],
    },
      //--------------------------

    // Venue Category Pages
    {path:"venue-category-pages",element:<VenueCategoryPageManage/>},
    {
      path: "venue-category-pages",
      children: [
        { path: "add", element: <VenueCategoryPageAdd /> },
        { path: "update/:id", element: <VenueCategoryPageAdd /> },
        { path: ":venueCategoryGuid/gallery", element: <VenueCategoryGalleryPage /> },
        { path: ":venueCategoryGuid/hosted", element: <VenueCategoryHostedPage /> },
        { path: ":venueCategoryGuid/distinctive", element: <VenueCategoryDistinctivePage /> },
        { path: ":venueCategoryGuid/moments", element: <VenueCategoryMomentsPage /> },
        { path: ":venueCategoryGuid/why-choose", element: <VenueCategoryWhyChoosePage /> },
        { path: ":venueCategoryGuid/faqs", element: <VenueCategoryFaqPage /> },
      ],
    },
      //--------------------------

    // Venue Subcategory Pages
    {path:"venue-subcategory-pages",element:<VenueSubcategoryPageManage/>},
    {
      path: "venue-subcategory-pages",
      children: [
        { path: "add", element: <VenueSubcategoryPageAdd /> },
        { path: "update/:id", element: <VenueSubcategoryPageAdd /> },
        { path: ":venueSubcategoryGuid/capacity", element: <VenueSubcategoryCapacityPage /> },
        {
          path: ":venueSubcategoryGuid/celebration-features",
          element: <VenueSubcategoryCelebrationFeaturesPage />,
        },
        { path: ":venueSubcategoryGuid/faqs", element: <VenueSubcategoryFaqPage /> },
        {
          path: ":venueSubcategoryGuid/intro-features",
          element: <VenueSubcategoryIntroFeaturesPage />,
        },
        { path: ":venueSubcategoryGuid/moments", element: <VenueSubcategoryMomentsPage /> },
        { path: ":venueSubcategoryGuid/why-choose", element: <VenueSubcategoryWhyChoosePage /> },
      ],
    },
      //--------------------------

    {path:"contact-enquiry",element:<ContactEnquiry/>},
    {path:"landing-page-enquiry",element:<LandingPageEnquiry/>},
      { path: "dashboard", element: <DashboardPage /> },
     
      { path: "my-profile", element: <ProfilePage /> },
      { path: "change-password", element: <ChangePassword /> },
      {path:"album-category",element:<AlbumCategory/>},
      {path:"blog-tag",element:<BlogTag/>},
      {path:"experience-category",element:<ExperienceCategory/>},
      {path:"venue-category",element:<VenueCategory/>},
      {path:"venue-sub-category",element:<VenueSubcategory/>},

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