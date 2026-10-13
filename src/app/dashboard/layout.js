"use client";

import Navbar from "@/components/layout/Navbar";
import SideMenu from "@/components/layout/SideMenu";
import RequireAuth from "@/components/auth/RequireAuth";

export default function DashboardLayout({ children }) {
  return (
    <div className="sky-dashboard">
      <div className="dashboard">
        <SideMenu />
        <div className="dashboard-body">
          <Navbar />
          <div className="px-lg-4">
            <RequireAuth>{children}</RequireAuth>
          </div>
        </div>
      </div>
    </div>
  );
}
