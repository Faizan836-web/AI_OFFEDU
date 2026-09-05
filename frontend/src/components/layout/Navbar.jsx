import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const searchItems = [
  { title: "Home", path: "/home" },
  { title: "AI Chat", path: "/chat" },
  { title: "Explain", path: "/explain" },
  { title: "Quiz", path: "/quiz" },
  { title: "Test Paper", path: "/test-paper" },
  { title: "Study Plan", path: "/study-plan" },
  { title: "Documents", path: "/documents" },
  { title: "File Tools", path: "/file-tools" },
  { title: "Profile", path: "/profile" },
  { title: "Settings", path: "/settings" },
];

const initialNotifications = [
  {
    id: 1,
    title: "Welcome to OFFEDU",
    message: "Your local AI study workspace is ready.",
    read: false,
  },
  {
    id: 2,
    title: "Study Plan",
    message: "Create a personalized study plan.",
    read: false,
  },
  {
    id: 3,
    title: "Documents",
    message: "Upload your study materials to get started.",
    read: true,
  },
];

function getPageTitle(pathname) {
  const page = searchItems.find(
    (item) => item.path === pathname,
  );

  return page?.title || "OFFEDU";
}

function Navbar({ onMobileMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] = useState(
    initialNotifications,
  );

  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  const filteredSearchItems = searchItems.filter((item) =>
    item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  /* =========================================================
     CLOSE MENUS WHEN CLICKING OUTSIDE
  ========================================================== */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =========================================================
     CLOSE EVERYTHING ON PAGE CHANGE
  ========================================================== */

  useEffect(() => {
    setSearchOpen(false);
    setSearchTerm("");
    setNotificationOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* =========================================================
     SEARCH
  ========================================================== */

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (filteredSearchItems.length === 0) {
      return;
    }

    navigate(filteredSearchItems[0].path);

    setSearchOpen(false);
    setSearchTerm("");
  };

  /* =========================================================
     NOTIFICATIONS
  ========================================================== */

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  const markNotificationAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  };

  /* =========================================================
     SIGN OUT
  ========================================================== */

  const handleSignOut = () => {
    setProfileOpen(false);

    alert(
      "Sign out will be connected to the authentication system later.",
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#05090a]/95 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}

          <button
            type="button"
            onClick={onMobileMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[#a0b1aa] transition hover:border-[#8fb8a8]/20 hover:bg-[#8fb8a8]/[0.06] hover:text-[#dce8e3] lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-[#edf3f0] sm:text-xl">
              {pageTitle}
            </h1>

            <p className="hidden text-xs text-[#667b72] sm:block">
              Your local AI study workspace
            </p>
          </div>
        </div>

        {/* ===================================================
            RIGHT
        ==================================================== */}

        <div className="flex items-center gap-1 sm:gap-2">
          {/* =================================================
              SEARCH
          ================================================== */}

          <div
            ref={searchRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen(
                  (previous) => !previous,
                );

                setNotificationOpen(false);
                setProfileOpen(false);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                searchOpen
                  ? "border-[#8fb8a8]/25 bg-[#8fb8a8]/[0.08] text-[#dbe8e2]"
                  : "border-transparent text-[#81958c] hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-[#dbe8e2]"
              }`}
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-12 w-[280px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1512] shadow-[0_25px_70px_rgba(0,0,0,0.5)] sm:w-[340px]">
                <form
                  onSubmit={handleSearchSubmit}
                  className="border-b border-white/[0.06] p-3"
                >
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3">
                    <Search
                      size={17}
                      className="shrink-0 text-[#60756c]"
                    />

                    <input
                      type="text"
                      autoFocus
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(event.target.value)
                      }
                      placeholder="Search pages..."
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#566961]"
                    />

                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchTerm("")
                        }
                        className="text-[#62766d] transition hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </form>

                <div className="max-h-72 overflow-y-auto p-2">
                  {filteredSearchItems.length > 0 ? (
                    filteredSearchItems.map(
                      (item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            navigate(item.path);
                            setSearchOpen(false);
                            setSearchTerm("");
                          }}
                          className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[#a8b9b2] transition hover:bg-[#8fb8a8]/[0.06] hover:text-white"
                        >
                          {item.title}
                        </button>
                      ),
                    )
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-[#62766d]">
                      No pages found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          <div
            ref={notificationRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setNotificationOpen(
                  (previous) => !previous,
                );

                setSearchOpen(false);
                setProfileOpen(false);
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                notificationOpen
                  ? "border-[#8fb8a8]/25 bg-[#8fb8a8]/[0.08] text-[#dbe8e2]"
                  : "border-transparent text-[#81958c] hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-[#dbe8e2]"
              }`}
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b7d0c5] shadow-[0_0_8px_rgba(183,208,197,0.65)]" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-12 w-[310px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1512] shadow-[0_25px_70px_rgba(0,0,0,0.5)] sm:w-[360px]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#edf3f0]">
                      Notifications
                    </h3>

                    <p className="text-xs text-[#60746b]">
                      {unreadCount} unread
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs text-[#879d93] transition hover:text-[#c5d7cf]"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {notifications.map(
                    (notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          markNotificationAsRead(
                            notification.id,
                          )
                        }
                        className={`flex w-full gap-3 rounded-xl p-3 text-left transition hover:bg-white/[0.04] ${
                          !notification.read
                            ? "bg-white/[0.025]"
                            : ""
                        }`}
                      >
                        <div className="mt-1 flex h-2 w-2 shrink-0 items-center justify-center">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              notification.read
                                ? "bg-[#465950]"
                                : "bg-[#9dbbae]"
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#cddbd5]">
                            {notification.title}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#687c73]">
                            {notification.message}
                          </p>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}

          <div className="mx-1 hidden h-7 w-px bg-white/[0.07] sm:block" />

          {/* =================================================
              PROFILE
          ================================================== */}

          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setProfileOpen(
                  (previous) => !previous,
                );

                setSearchOpen(false);
                setNotificationOpen(false);
              }}
              className={`flex h-10 items-center gap-2 rounded-xl border px-2 transition ${
                profileOpen
                  ? "border-[#8fb8a8]/20 bg-[#8fb8a8]/[0.07]"
                  : "border-transparent hover:border-white/[0.08] hover:bg-white/[0.04]"
              }`}
              aria-label="Profile menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-[#a4b5ae]">
                <User size={17} />
              </div>

              <div className="hidden text-left md:block">
                <p className="text-xs font-medium text-[#e7efeb]">
                  Student
                </p>

                <p className="text-[10px] text-[#62766d]">
                  Local Account
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-[#657970] transition-transform md:block ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}

            {profileOpen && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1512] p-2 shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <p className="text-sm font-semibold text-[#e8f0ec]">
                    OFFEDU Student
                  </p>

                  <p className="mt-1 truncate text-xs text-[#62766d]">
                    student@example.com
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a7b8b1] transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <User size={17} />
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#a7b8b1] transition hover:bg-white/[0.04] hover:text-white"
                  >
                    <Settings size={17} />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-white/[0.06] pt-2">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#788b83] transition hover:bg-white/[0.04] hover:text-[#d2dfd9]"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;