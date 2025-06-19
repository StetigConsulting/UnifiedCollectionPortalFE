"use client";

import React, { useState, useMemo } from "react";
import ReactTable from "@/components/ReactTable";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";

// Define the data type for the table rows
interface SecurityDepositRow {
  agencyId: string;
  agencyName: string;
  depositAmount: string;
  depositDate: string;
  status: string;
}

// Explicitly type the columns array
const columns: { label: string; key: keyof SecurityDepositRow }[] = [
  { label: "Agency ID", key: "agencyId" },
  { label: "Agency Name", key: "agencyName" },
  { label: "Security Deposit Amount", key: "depositAmount" },
  { label: "Deposit Date", key: "depositDate" },
  { label: "Status", key: "status" },
];

const data: SecurityDepositRow[] = [
  {
    agencyId: "A001",
    agencyName: "Demo Agency 1",
    depositAmount: "₹ 10,000",
    depositDate: "01/04/2024",
    status: "Received",
  },
  {
    agencyId: "A002",
    agencyName: "Demo Agency 2",
    depositAmount: "₹ 8,000",
    depositDate: "15/04/2024",
    status: "Pending",
  },
  {
    agencyId: "A003",
    agencyName: "Demo Agency 3",
    depositAmount: "₹ 12,000",
    depositDate: "20/04/2024",
    status: "Received",
  },
  {
    agencyId: "A004",
    agencyName: "Demo Agency 4",
    depositAmount: "₹ 9,000",
    depositDate: "25/04/2024",
    status: "Pending",
  },
  {
    agencyId: "A005",
    agencyName: "Demo Agency 5",
    depositAmount: "₹ 11,000",
    depositDate: "28/04/2024",
    status: "Received",
  },
];

const getUniqueAgencies = () => {
  const seen = new Set();
  return data
    .map((row) => ({ value: row.agencyName, label: row.agencyName }))
    .filter((item) => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
};

const SecurityDepositListing = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageSize, setPageSize] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState("");

  // Filtering logic
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filter by agency
      if (selectedAgency && row.agencyName !== selectedAgency) return false;
      // Filter by fromDate
      if (fromDate) {
        const [d, m, y] = row.depositDate.split("/");
        const rowDate = new Date(`${y}-${m}-${d}`);
        const [fd, fm, fy] = fromDate.split("-");
        const from = new Date(`${fd}-${fm}-${fy}`);
        if (rowDate < from) return false;
      }
      // Filter by toDate
      if (toDate) {
        const [d, m, y] = row.depositDate.split("/");
        const rowDate = new Date(`${y}-${m}-${d}`);
        const [td, tm, ty] = toDate.split("-");
        const to = new Date(`${td}-${tm}-${ty}`);
        if (rowDate > to) return false;
      }
      return true;
    });
  }, [fromDate, toDate, selectedAgency]);

  // Pagination logic
  const totalPageNumber = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPageNumber) {
      setCurrentPage(page);
    }
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, selectedAgency, pageSize]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Security Deposit Listing</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <CustomizedInputWithLabel
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <CustomizedInputWithLabel
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <CustomizedInputWithLabel
          label="Page Size"
          type="number"
          value={pageSize}
          min={1}
          onChange={(e) => setPageSize(Number(e.target.value) || 1)}
        />
        <CustomizedSelectInputWithLabel
          label="Agency Name"
          list={getUniqueAgencies()}
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
          placeholder="Select Agency"
        />
      </div>
      <ReactTable
        data={paginatedData}
        columns={columns}
        dynamicPagination
        itemsPerPage={pageSize}
        pageNumber={currentPage}
        onPageChange={handlePageChange}
        totalPageNumber={totalPageNumber}
        hideSearchAndOtherButtons
      />
    </div>
  );
};

export default SecurityDepositListing;
