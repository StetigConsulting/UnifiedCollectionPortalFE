"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import ReactTable from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { exportPicklist, getErrorMessage, tableDataPerPage } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agencyMidNightSchema, AgencyMidNightFormData } from "@/lib/zod";
import {
  getAgencyMidNightBalance,
  downloadAgencyMidNightBalance,
} from "@/app/api-calls/report/api";
import { getAgenciesWithDiscom } from "@/app/api-calls/department/api";
import moment from "moment";

const AgencyMidNightReport = () => {
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
  } = useForm<AgencyMidNightFormData>({
    resolver: zodResolver(agencyMidNightSchema),
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
      { label: "Updated Date Time", key: "updated_datetime", sortable: true },
      { label: "Agency Mobile No.", key: "agency_mobile_number", sortable: false },
      { label: "Agency Name", key: "agency_name", sortable: true },
      {
        label: "Agency Balance",
        key: "agency_balance",
        sortable: true,
      },
      {
        label: "Agent Wallet Balance",
        key: "agent_wallet_balance",
        sortable: true,
      },
      {
        label: "Agency Recharge Balance Available",
        key: "agency_recharge_balance_available",
        sortable: true,
      },
      { label: "Agency Status", key: "agency_status", sortable: true },
    ],
    []
  );

  const formatData = dataList?.map(item => ({
    ...item,
    updated_datetime: moment(item?.updated_datetime).format('DD-MM-YYYY, hh:mm A')
  }))

  const getPayload = (data) => {

    let agencySelected = agencyList.filter(item => item.id === Number(data?.agency)) || []

    return {
      filter: {
        date_range: {
          from_date: data.fromDate,
          to_date: data.toDate,
        },
        ...(agencySelected.length > 0 && { agency_name: agencySelected?.[0]?.name }),
      },
    };
  };

  const getReportData = async (page = 1) => {
    try {
      setIsLoading(true);
       
      let payload = {
        page: currentPage,
        page_size: formData?.pageSize,
        ...getPayload(formData)
      };
      const response = await getAgencyMidNightBalance(payload);
      setDataList(response.data.data);
      setCurrentPage(page);
      setTotalPages(response.data.totalPages);
      setShowTable(true);
      setPageSize(formData.pageSize);
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
      const response = await downloadAgencyMidNightBalance(payload, type);
      const contentDisposition = response.headers["content-disposition"];
      let filename = "AgencyMidNightBalance";
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
      pageTitle="Agency Mid Night Balance"
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
              handleExportFile(exportType);
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

export default AgencyMidNightReport;
