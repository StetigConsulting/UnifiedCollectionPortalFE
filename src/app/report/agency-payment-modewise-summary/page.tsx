"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import ReactTable from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { exportPicklist, formatDate, getErrorMessage, tableDataPerPage } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agencyPaymentModewiseSummarySchema, AgencyPaymentModewiseSummaryFormData } from "@/lib/zod";
import {
  getAgencyPaymentModewiseSummaryReport,
  downloadAgencyPaymentModewiseSummaryReport,
} from "@/app/api-calls/report/api";
import { getAgenciesWithDiscom } from "@/app/api-calls/department/api";
import moment from "moment";

const AgencyPaymentModewiseSummaryReport = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dataList, setDataList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [exportType, setExportType] = useState("");
  const [agencyList, setAgencyList] = useState<any>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AgencyPaymentModewiseSummaryFormData>({
    resolver: zodResolver(agencyPaymentModewiseSummarySchema),
    defaultValues: {
      fromDate: "",
      toDate: "",
      agency: "",
      pageSize: tableDataPerPage,
    },
  });
  const formData = watch();
  const [pageSize, setPageSize] = useState(formData?.pageSize);

  const columns = useMemo(
    () => [
      { label: "Agency Name", key: "agency_name", sortable: true },
      { label: "Agency Mobile No.", key: "agency_mobile", sortable: true },
      { label: "Collection Date", key: "collection_date", sortable: true },
      { label: "Payment Mode", key: "payment_mode", sortable: true },
      { label: "No. Of Consumers", key: "no_of_consumers", sortable: true },
      { label: "Total MR", key: "total_mr", sortable: true },
      { label: "Amount Collected", key: "amount_collected", sortable: true },
    ],
    []
  );

  const formatData = dataList?.map((item, index) => ({
    ...item,
    sl_no: (currentPage - 1) * pageSize + index + 1,
    collection_date: formatDate(item?.collection_date),
    amount_collected: item?.amount_collected ? `₹${parseFloat(item.amount_collected).toFixed(2)}` : "₹0.00"
  }));

  const getPayload = (data) => {
    let agencySelected = data?.agency && agencyList.filter(item => item.id === Number(data?.agency)) || []

    return {
      transaction_date_range: {
          from_date: data.fromDate,
          to_date: data.toDate,
        },
        ...(agencySelected.length > 0 && { agency_name: agencySelected?.[0]?.name }),
    };
  };

  const getReportData = async (page = 1) => {
    try {
      setIsLoading(true);
       
      let payload = {
        page: page,
        page_size: formData?.pageSize,
        filter: getPayload(formData)
      };
      const response = await getAgencyPaymentModewiseSummaryReport(payload);
      setDataList(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setShowTable(true);
      setPageSize(response.data.pageSize);
    } catch (error) {
      toast.error("Error: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => getReportData(1);

  const handleExportFile = async (type = "csv") => {
    setExportType(type);
    try {
      setIsLoading(true);
      let payload = getPayload(formData);
      const response = await downloadAgencyPaymentModewiseSummaryReport(payload, type);
      const contentDisposition = response.headers["content-disposition"];
      let filename = "AgencyPaymentModewiseSummary";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches.length > 1) {
          filename = matches[1];
        }
      }
      let extension = type;
      const blob = new Blob([response.data], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.includes(`.${extension}`)
        ? filename
        : `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setExportType("");
    }
  };

  const handlePageChange = (page) => {
    getReportData(page);
  };

  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      const response = await getAgenciesWithDiscom(session.user.discomId);
      setAgencyList(
        response?.data?.map((item) => ({
          name: item.agency_name,
          label: `${item.agency_name} - ${item.phone}`,
          value: item.id,
          id: item.id,
        })) || []
      );
    } catch (err) {
      console.error("Error: " + getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  return (
    <AuthUserReusableCode
      pageTitle="Agency Payment Modewise Summary"
      isLoading={isLoading}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-4"
      >
        <div className="grid grid-cols-6 gap-4 flex-grow">
          <CustomizedInputWithLabel
            label="From Date"
            type="date"
            required
            {...register("fromDate")}
            errors={errors.fromDate}
          />
          <CustomizedInputWithLabel
            label="To Date"
            type="date"
            required
            {...register("toDate")}
            errors={errors.toDate}
          />
          <CustomizedSelectInputWithLabel
            label="Agency"
            list={agencyList}
            {...register("agency")}
            errors={errors.agency}
          />
          <CustomizedInputWithLabel
            label="Page Size"
            type="number"
            required
            {...register("pageSize", { valueAsNumber: true })}
            errors={errors.pageSize}
          />
          <div className="mt-6">
            <Button variant="default" type="submit">
              Search
            </Button>
          </div>
          <CustomizedSelectInputWithLabel
            label="Export"
            placeholder="Export to"
            list={exportPicklist}
            value={exportType}
            onChange={(e) => {
              const exportType = e.target.value;
              exportType && handleSubmit((data) => handleExportFile(exportType))();
            }}
          />
        </div>
      </form>
      <div className="overflow-x-auto mb-4 mt-4">
        {showTable && (
          <ReactTable
            data={formatData}
            columns={columns}
            hideSearchAndOtherButtons
            dynamicPagination
            itemsPerPage={pageSize}
            pageNumber={currentPage}
            onPageChange={handlePageChange}
            totalPageNumber={totalPages}
          />
        )}
      </div>
    </AuthUserReusableCode>
  );
};

export default AgencyPaymentModewiseSummaryReport;
