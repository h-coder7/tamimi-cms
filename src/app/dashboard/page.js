"use client";

import dynamic from "next/dynamic";
import PageHeader from "@/components/layout/PageHeader";
import DashboardFilters from "@/components/dashboard/overview/DashboardFilters";
import StatsCards from "@/components/dashboard/overview/StatsCards";
import ContentReadiness from "@/components/dashboard/overview/ContentReadiness";
import LatestMessages from "@/components/dashboard/overview/LatestMessages";

const SalesTowardsTargets = dynamic(
  () => import("@/components/dashboard/overview/SalesTowardsTargets"),
  { loading: () => <div className="card border-0 radius-15 p-4 mt-4" style={{ minHeight: 380 }} /> }
);
const LeadConversionChart = dynamic(
  () => import("@/components/dashboard/overview/LeadConversionChart"),
  { loading: () => <div className="card border-0 radius-15 p-4 mt-4" style={{ minHeight: 380 }} /> }
);

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
