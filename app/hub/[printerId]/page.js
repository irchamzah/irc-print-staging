"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useHubData } from "./hooks/useHubData";
import { HubHeader } from "./components/HubHeader";
import { DateRangeFilter } from "./components/DateRangeFilter";
import { PaperStatusCard } from "./components/PaperStatusCard";
import { ProfitOverview } from "./components/ProfitOverview";
import { PaperRefillHistory } from "./components/PaperRefillHistory";
import { RefillDetailModal } from "./components/RefillDetailModal";
import { PrintJobsTable } from "./components/PrintJobsTable";
import { InfoCard } from "./components/InfoCard";

export default function PartnerHubPage() {
  const params = useParams();
  const printerId = params.printerId;

  const {
    printer,
    printJobs,
    paperRefills,
    profit,
    loading,
    formatRupiah,
    formatDate,
    formatShortDate,
    handleRefillPaper,
    getJobsByRefill,

    // Data yang sudah difilter
    filteredJobs,
    filteredRefills,
    filteredTotalRevenue,
    filteredPartnerProfit,

    // Date range
    dateRange,
    setCustomDateRange,
    resetDateRange,
  } = useHubData(printerId);

  const [showRefillSuccess, setShowRefillSuccess] = useState(false);
  const [selectedRefill, setSelectedRefill] = useState(null);
  const [showRefillModal, setShowRefillModal] = useState(false);

  const handleRefill = () => {
    handleRefillPaper();
    setShowRefillSuccess(true);
    setTimeout(() => setShowRefillSuccess(false), 3000);
  };

  const handleViewRefill = (refill) => {
    const relatedJobs = getJobsByRefill(refill.refillId);
    setSelectedRefill({ ...refill, jobs: relatedJobs });
    setShowRefillModal(true);
  };

  const handleApplyFilter = (startDate, endDate) => {
    setCustomDateRange(startDate, endDate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <HubHeader printerId={printerId} printerName={printer.name} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PaperStatusCard
          paperCount={printer.paperStatus.paperCount}
          lastRefill={printer.paperStatus.lastRefill}
          onRefill={handleRefill}
          loading={loading}
          showSuccess={showRefillSuccess}
          formatDate={formatDate}
        />

        {/* ✅ FILTER BARU */}
        <DateRangeFilter
          dateRange={dateRange}
          onApplyFilter={handleApplyFilter}
          onResetFilter={resetDateRange}
          formatDate={formatDate}
        />

        <ProfitOverview
          totalRevenue={filteredTotalRevenue}
          profitShare={profit.profitShare}
          pendingPayout={profit.pendingPayout}
          totalProfit={profit.partnerProfit}
          formatRupiah={formatRupiah}
          dateRange={dateRange}
        />

        <PaperRefillHistory
          refills={filteredRefills} // ✅ Gunakan filteredRefills
          onViewRefill={handleViewRefill}
          formatRupiah={formatRupiah}
          formatShortDate={formatShortDate}
        />

        <PrintJobsTable
          jobs={filteredJobs} // ✅ Gunakan filteredJobs
          refills={paperRefills} // Tetap pakai semua refills untuk lookup
          onViewRefill={handleViewRefill}
          formatRupiah={formatRupiah}
          formatDate={formatDate}
          formatShortDate={formatShortDate}
        />

        <InfoCard profitShare={profit.profitShare} />
      </div>

      <RefillDetailModal
        isOpen={showRefillModal}
        refill={selectedRefill}
        jobs={selectedRefill?.jobs}
        onClose={() => setShowRefillModal(false)}
        formatRupiah={formatRupiah}
        formatDate={formatDate}
      />
    </div>
  );
}
