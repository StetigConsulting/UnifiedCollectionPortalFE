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
import { digitalPaymentCollectionSchema, DigitalPaymentCollectionFormData } from "@/lib/zod";
import {
  getDigitalPaymentCollectionReport,
  downloadDigitalPaymentCollectionReport,
} from "@/app/api-calls/report/api";
import { getAgenciesWithDiscom } from "@/app/api-calls/department/api";
import moment from "moment";

const DigitalPaymentCollectionReport = () => {
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
  } = useForm<DigitalPaymentCollectionFormData>({
    resolver: zodResolver(digitalPaymentCollectionSchema),
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
      { label: "Circle", key: "level_1_name", sortable: true },
      { label: "Division", key: "level_2_name", sortable: true },
      { label: "Sub Division", key: "level_3_name", sortable: true },
      { label: "Section", key: "level_4_name", sortable: true },
      { label: "Binder", key: "level_5_name", sortable: true },
      { label: "MRU", key: "level_6_name", sortable: true },
      { label: "Agency Name", key: "agency_name", sortable: true },
      { label: "Agent Name", key: "agent_name", sortable: true },
      { label: "Agent Mobile No.", key: "agent_mobile", sortable: true },
      { label: "MPos Serial No", key: "m_pos_serial_no", sortable: true },
      { label: "Consumer No", key: "consumer_no", sortable: true },
      { label: "Money Receipt No", key: "money_receipt_no", sortable: true },
      { label: "Transaction ID", key: "txn_id", sortable: true },
      { label: "Transaction Date", key: "transaction_date", sortable: true },
      { label: "Transaction Time", key: "transaction_time", sortable: true },
      { label: "Transaction Amount", key: "txn_amount", sortable: true },
      { label: "Pay Mode", key: "payment_mode", sortable: true },
    ],
    []
  );

  const formatData = dataList?.map(item => ({
    ...item,
    transaction_date: formatDate(item?.transaction_date)
  }));

  const getPayload = (data) => {
    let agencySelected = data?.agency && agencyList.filter(item => item.id === Number(data?.agency)) || []

    console.log(data,agencySelected,agencyList)

    return {
        date_range: {
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
      const response = await getDigitalPaymentCollectionReport(payload);
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
      const response = await downloadDigitalPaymentCollectionReport(payload, type);
      const contentDisposition = response.headers["content-disposition"];
      let filename = "DigitalPaymentCollection";
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
      pageTitle="Digital Payment Collection"
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

export default DigitalPaymentCollectionReport; 