import Navbar from "@/components/layout/Navbar";
import SideMenu from "@/components/layout/SideMenu";

export default function DashboardLayout({ children }) {
  return (
    <div className="sky-dashboard">
      <div className="dashboard">
        <SideMenu />
        <div className="dashboard-body">
          <Navbar />
          <div className="px-lg-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
