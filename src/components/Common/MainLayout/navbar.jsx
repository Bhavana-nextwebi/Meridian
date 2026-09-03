import React, { useEffect, useState } from "react";
import allImages from "../../../assets/images-import";
import { Link, useLocation } from "react-router-dom";
import { getMenus } from "../../../services/manageAccess";
import { handleErrors } from "../../../utils/errorHandler";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

export const Navbar = () => {
  const [menus, setMenus] = useState([]);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();

  const isActive = (path) => {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return location.pathname === normalized;
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await getMenus();
        const filteredMenus = response.data.result.filter(
          (menu) => menu.showInMenu && menu.viewAccess
        );
        setMenus(filteredMenus);
      } catch (error) {
        handleErrors(error);
      }
    };
    fetchMenus();
  }, []);

  const groupedMenus = menus.reduce((acc, menu) => {
    if (!acc[menu.pageGroupName]) {
      acc[menu.pageGroupName] = [];
    }
    acc[menu.pageGroupName].push(menu);
    return acc;
  }, {});

  // Auto-open the group that contains the currently active route,
  // so a refresh/navigation lands with the right group expanded.
  useEffect(() => {
    const activeGroup = Object.keys(groupedMenus).find((groupName) =>
      groupedMenus[groupName]
        .filter((page) => page.showInMenu && page.viewAccess)
        .some((page) => isActive(`/${page.pageLink}`))
    );
    if (activeGroup) {
      setOpenGroup(activeGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus, location.pathname]);

  const toggleGroup = (groupName) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  return (
    <div className="app-menu navbar-menu">
      <div className="navbar-brand-box">
        <a href="/" className="logo logo-dark">
          <span className="logo-sm">
            <img src={allImages.MeridianFavicon} alt="" height="30" />
          </span>
          <span className="logo-lg">
            <img src={allImages.logoMeridian} alt="" height="60" />
          </span>
        </a>
        <a href="/" className="logo logo-light">
          <span className="logo-sm">
            <img src={allImages.MeridianFavicon} alt="" height="60" />
          </span>
          <span className="logo-lg">
            <img src={allImages.logoMeridian} alt="" height="60" />
          </span>
        </a>
        <button
          type="button"
          className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
          id="vertical-hover"
        >
          <i className="ri-record-circle-line"></i>
        </button>
      </div>

      <SimpleBar className="h-100" id="scrollbar">
        <div className="menu-title">
          <span data-key="t-menu">Menu</span>
        </div>
        <div className="container-fluid">
          <ul className="navbar-nav" id="navbar-nav">
            {Object.keys(groupedMenus).map((groupName, index) => {
              const groupItems = groupedMenus[groupName];
              const visiblePages = groupItems.filter(
                (page) => page.showInMenu && page.viewAccess
              );

              if (visiblePages.length === 0) return null;

              const isOpen = openGroup === groupName;

              return (
                <li className="nav-item" key={index}>
                  {visiblePages.length > 1 ? (
                    <>
                      <a
                        className={`nav-link menu-link${isOpen ? " active" : ""}`}
                        href={`#sidebar${groupName.replace(/\s+/g, "")}`}
                        role="button"
                        aria-expanded={isOpen}
                        aria-controls={`sidebar${groupName.replace(
                          /\s+/g,
                          ""
                        )}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleGroup(groupName);
                        }}
                      >
                        <i
                          dangerouslySetInnerHTML={{
                            __html: groupItems[0].groupIcon,
                          }}
                        ></i>
                        <span>{groupName}</span>
                      </a>
                      <div
                        className={`collapse menu-dropdown${isOpen ? " show" : ""}`}
                        id={`sidebar${groupName.replace(/\s+/g, "")}`}
                      >
                        <ul className="nav nav-sm flex-column">
                          {visiblePages.map((page) => (
                            <li className="nav-item" key={page.pageId}>
                              <Link
                                to={`/${page.pageLink}`}
                                className={`nav-link${
                                  isActive(`/${page.pageLink}`) ? " active" : ""
                                }`}
                                data-key={page.pageDesc}
                              >
                                {page.pageName}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={`/${visiblePages[0].pageLink}`}
                      className={`nav-link menu-link${
                        isActive(`/${visiblePages[0].pageLink}`) ? " active" : ""
                      }`}
                    >
                      <i
                        dangerouslySetInnerHTML={{
                          __html: groupItems[0].groupIcon,
                        }}
                      ></i>
                      <span>{groupName}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </SimpleBar>

      <div className="sidebar-background"></div>
    </div>
  );
};