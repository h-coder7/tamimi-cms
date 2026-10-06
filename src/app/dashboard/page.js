import PageHeader from "@/components/layout/PageHeader";
import DashboardFilters from "@/components/dashboard/overview/DashboardFilters";
import StatsCards from "@/components/dashboard/overview/StatsCards";
import SalesTowardsTargets from "@/components/dashboard/overview/SalesTowardsTargets";
import LeadConversionChart from "@/components/dashboard/overview/LeadConversionChart";
import ContentReadiness from "@/components/dashboard/overview/ContentReadiness";
import LatestMessages from "@/components/dashboard/overview/LatestMessages";

export default function DashboardPage() {
    return (
        <div>
            <PageHeader title="Overview" icon="fal fa-chart-simple" titleCol="col-lg-4" actionCol="col-lg-8">
                <DashboardFilters />
            </PageHeader>
            <StatsCards />
            <div className="row">
                <div className="col-lg-4">
                    <SalesTowardsTargets />
                </div>
                <div className="col-lg-8">
                    <LeadConversionChart />
                </div>
            </div>
            <div className="row mb-5">
                <div className="col-lg-8">
                    <ContentReadiness />
                </div>
                <div className="col-lg-4">
                    <LatestMessages />
                </div>
            </div>
        </div>
    );
}
