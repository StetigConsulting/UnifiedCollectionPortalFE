"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  agencySecurityDepositSchema,
  AgencySecurityDepositFormData,
} from "@/lib/zod";
import { toast } from "sonner";
import {
  formatDate,
  getErrorMessage,
  tableDataPerPage,
  exportPicklist,
} from "@/lib/utils";
import ReactTable from "@/components/ReactTable";
import { Eye, Loader2, Download, Edit } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  getAgenciesWithDiscom,
  uploadAgencySecurityDepositFile,
  addAgencySecurityDeposit,
  getAllGlobalPaymentMode,
  getAgencySecurityDepositHistory,
  downloadAgencySecurityDepositHistory,
  downloadUploadedFileSecurityDeposit,
  editAgencySecurityDeposit,
} from "@/app/api-calls/department/api";
import SuccessErrorModal from "@/components/SuccessErrorModal";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";
import moment from "moment";

const AgencySecurityDeposit = () => {
  const { data: session } = useSession();
  const [agencyList, setAgencyList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(tableDataPerPage);
  const [paymentModes, setPaymentModes] = useState([]);
  const [exportType, setExportType] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AgencySecurityDepositFormData>({
    resolver: zodResolver(agencySecurityDepositSchema),
    defaultValues: {},
  });

  const formData = watch();

  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const res = await getAgenciesWithDiscom(session?.user?.discomId);
      setAgencyList(
        res?.data?.map((item) => ({
          ...item,
          label: item.agency_name,
          value: item.id,
        })) || []
      );
    } catch (e) {
      toast.error("Failed to fetch agencies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentModes = async () => {
    setIsLoading(true);
    try {
      const res = await getAllGlobalPaymentMode();
      setPaymentModes(
        res?.data
          ?.filter((ite) => ite.mode_type == "Security Deposit")
          ?.map((ite) => {
            return {
              label: ite.mode_name,
              value: ite.id,
            };
          })
      );
    } catch (e) {
      console.error("Failed to fetch payment modes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
    fetchPaymentModes();
  }, []);

  const fetchTableData = async (page = 1, filters = {}) => {
    setTableLoading(true);
    try {
      const payload = {
        page,
        page_size: tableDataPerPage,
        filter: {
          ...filters,
        },
      };
      const res = await getAgencySecurityDepositHistory(payload);
      setTableData(res?.data?.data || []);
      setCurrentPage(page);
      setTotalPages(res?.data?.totalPages || 1);
      setPageSize(res?.data?.pageSize || tableDataPerPage);
    } catch (err) {
      setTableData([]);
      setTotalPages(1);
    } finally {
      setTableLoading(false);
    }
  };

  const handleAgencyChange = (e) => {
    if (e.target.value) {
      setValue("agencyId", e.target.value);
      fetchTableData(1, { agency_id: Number(e.target.value) });
    } else {
      setTableData([]);
    }
  };

  const handlePageChange = (page) => {
    fetchTableData(page);
  };

  const onSubmit = async (data: AgencySecurityDepositFormData) => {
    setIsSubmitting(true);
    try {
      console.log(data);
      let fileName = null;
      if (data?.upload?.length > 0 && typeof data.upload !== "string") {
        const formDataUpload = new FormData();
        formDataUpload.append("file", data.upload[0]);

        const fileUploadRes = await uploadAgencySecurityDepositFile(
          formDataUpload
        );
        fileName = fileUploadRes?.data?.filePath;
      } else if (typeof data.upload === "string") {
        fileName = data?.upload;
      }

      const payload = {
        ...(isEditing && { id: selectedRow?.id }),
        ...(!isEditing && { agency_id: data.agencyId }),
        bg_amount: data.bgAmount,
        payment_date: data.paymentDate,
        validity_from_date: data.bgValidityFrom,
        validity_to_date: data.bgValidityTo,
        security_deposit_payment_mode: Number(data.paymentMode),
        ...(data?.transactionId && {
          transaction_id: data.transactionId,
        }),
        ...(data?.chequeDdNo && {
          dd_cheque_date: data.chequeDdDate,
        }),
        ...(data?.chequeDdNo && {
          dd_cheque_no: data.chequeDdNo,
        }),
        ...(data?.chequeDdBankName && {
          dd_cheque_bank_name: data.chequeDdBankName,
        }),
        ...(data?.claimPeriod && {
          claim_period: data.claimPeriod,
        }),
        ...(data?.remarks && {
          remarks: data.remarks,
        }),
        ...(data?.upload && {
          upload_file_name: fileName,
        }),
      };

      if (isEditing) {
        const res = await editAgencySecurityDeposit(payload);
        setSuccessErrorModalState({
          isOpen: true,
          message: res?.message,
          type: "success",
        });
        reset();
        setIsEditing(false);
        setSelectedRow(null);
      } else {
        const res = await addAgencySecurityDeposit(payload);
        setSuccessErrorModalState({
          isOpen: true,
          message: res?.message,
          type: "success",
        });
        reset();
      }
    } catch (e) {
      setSuccessErrorModalState({
        isOpen: true,
        message: "Error: " + getErrorMessage(e),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [successErrorModalState, setSuccessErrorModalState] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const handleExportFile = async (type) => {
    if (!formData?.agencyId) return;
    setExportType(type);
    setExportLoading(true);
    try {
      const response = await downloadAgencySecurityDepositHistory(
        { agency_id: Number(formData.agencyId) },
        type
      );
      const contentDisposition = response.headers["content-disposition"];
      let filename = "AgencySecurityDepositHistory";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches.length > 1) {
          filename = matches[1];
        }
      }
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      let extension = type;
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
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setExportLoading(false);
      setExportType("");
    }
  };

  const handleGetFile = async (id, fileName) => {
    setIsLoading(true);
    try {
      const response = await downloadUploadedFileSecurityDeposit(id);

      let filename = fileName;

      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^\"]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      const contentType = response.headers["content-type"] || "image/png";

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { label: "Agency", key: "agency_name" },
    { label: "Amount", key: "bg_amount" },
    { label: "Payment Date", key: "payment_date" },
    { label: "Payment Mode", key: "payment_mode_formatted" },
    { label: "Transaction ID", key: "transaction_id" },
    { label: "Cheque/DD No.", key: "dd_cheque_no" },
    { label: "Cheque/DD Date", key: "dd_cheque_date" },
    { label: "Cheque/DD Bank Name", key: "dd_cheque_bank_name" },
    { label: "BG Validity From", key: "validity_from_date" },
    { label: "BG Validity To", key: "validity_to_date" },
    { label: "Claim Period", key: "claim_period" },
    { label: "Remarks", key: "remarks" },
    { label: "File Uploaded", key: "upload" },
  ];

  const formatData = tableData.map((item) => ({
    ...item,
    payment_mode_formatted: item.payment_date
      ? formatDate(item.payment_date)
      : "",
    payment_mode: item.security_deposit_payment_mode?.mode_name,
    cheque_dd_date: item.cheque_dd_date ? formatDate(item.cheque_dd_date) : "",
    bg_validity_from: item.bg_validity_from
      ? formatDate(item.bg_validity_from)
      : "",
    bg_validity_to: item.bg_validity_to ? formatDate(item.bg_validity_to) : "",
    upload: item.uploaded_file_name ? (
      <Download
        className="pointer"
        onClick={() => handleGetFile(item?.id, item?.uploaded_file_name)}
      />
    ) : (
      "-"
    ),
  }));

  const [stateForConfirmationPopup, setStateForConfirmationPopup] =
    useState(false);

  const handleRowSelection = (row) => {
    setSelectedRow(row);
  };

  const handleEdit = () => {
    console.log(selectedRow);
    setIsEditing(true);
    setValue("agencyId", selectedRow?.agency_id);
    setValue("bgAmount", selectedRow?.bg_amount);
    let paymentDate = selectedRow?.payment_date
      ? moment(selectedRow.payment_date).format("YYYY-MM-DD")
      : "";
    console.log(paymentDate, selectedRow?.payment_date);
    setValue("paymentDate", paymentDate);
    setValue("paymentMode", selectedRow?.security_deposit_payment_mode?.id);
    setValue("transactionId", selectedRow?.transaction_id || "");
    setValue("chequeDdNo", selectedRow?.dd_cheque_no || "");
    setValue("chequeDdDate", selectedRow?.dd_cheque_date || "");
    setValue("chequeDdBankName", selectedRow?.dd_cheque_bank_name || "");
    setValue("bgValidityFrom", selectedRow?.validity_from_date);
    setValue("bgValidityTo", selectedRow?.validity_to_date);
    setValue("claimPeriod", selectedRow?.claim_period || "");
    setValue("remarks", selectedRow?.remarks || "");
    setValue("upload", selectedRow?.uploaded_file_name || "");
  };

  return (
    <AuthUserReusableCode
      pageTitle="Agency Security Deposit"
      isLoading={isLoading || tableLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CustomizedSelectInputWithLabel
            label="Agency"
            errors={errors.agencyId}
            containerClass=""
            placeholder="Select Agency"
            list={agencyList}
            disabled={isEditing}
            required
            {...register("agencyId", {
              valueAsNumber: true,
              onChange: (e) => handleAgencyChange(e),
            })}
          />
          <CustomizedInputWithLabel
            label="BG Amount"
            errors={errors.bgAmount}
            containerClass=""
            placeholder="Enter BG Amount"
            type="number"
            required
            {...register("bgAmount", { valueAsNumber: true })}
          />
          <CustomizedInputWithLabel
            label="Payment Date"
            errors={errors.paymentDate}
            containerClass=""
            type="date"
            required
            {...register("paymentDate")}
          />
          <CustomizedSelectInputWithLabel
            label="Payment Mode"
            errors={errors.paymentMode}
            containerClass=""
            placeholder="Select Payment Mode"
            list={paymentModes}
            required
            {...register("paymentMode", { valueAsNumber: true })}
          />
          <CustomizedInputWithLabel
            label="Transaction ID"
            errors={errors.transactionId}
            containerClass=""
            placeholder="Enter Transaction ID"
            {...register("transactionId")}
          />
          <CustomizedInputWithLabel
            label="Cheque/DD No."
            errors={errors.chequeDdNo}
            containerClass=""
            placeholder="Enter Cheque/DD No."
            {...register("chequeDdNo")}
          />
          <CustomizedInputWithLabel
            label="Cheque/DD Date"
            errors={errors.chequeDdDate}
            containerClass=""
            type="date"
            {...register("chequeDdDate")}
          />
          <CustomizedInputWithLabel
            label="Cheque/DD Bank Name"
            errors={errors.chequeDdBankName}
            containerClass=""
            type="text"
            {...register("chequeDdBankName")}
          />
          <CustomizedInputWithLabel
            label="BG Validity From"
            errors={errors.bgValidityFrom}
            containerClass=""
            type="date"
            required
            {...register("bgValidityFrom")}
          />
          <CustomizedInputWithLabel
            label="BG Validity To"
            errors={errors.bgValidityTo}
            containerClass=""
            type="date"
            required
            {...register("bgValidityTo")}
          />
          <CustomizedInputWithLabel
            label="Claim Period"
            errors={errors.claimPeriod}
            containerClass=""
            placeholder="Enter Claim Period"
            {...register("claimPeriod")}
          />
          <CustomizedInputWithLabel
            label="Remarks"
            errors={errors.remarks}
            containerClass=""
            placeholder="Enter Remarks"
            {...register("remarks")}
          />
          <CustomizedInputWithLabel
            label="Upload"
            errors={errors.upload}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            additionAction={
              isEditing &&
              typeof formData.upload === "string" &&
              formData.upload && (
                <div className="text-xs mt-1 text-gray-600">
                  Current file: {formData.upload}
                </div>
              )
            }
            {...register("upload")}
          />
        </div>
        <div className="flex justify-end mt-4">
          <AlertPopupWithState
            triggerCode={
              <Button
                variant="default"
                disabled={isSubmitting}
                onClick={handleSubmit((e) => {
                  setStateForConfirmationPopup(true);
                })}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            }
            handleContinue={handleSubmit(onSubmit)}
            title="Confirm Agency Security Details"
            description="Are you sure you want to save the Agency Security Details?"
            continueButtonText="Yes"
            isOpen={stateForConfirmationPopup}
            setIsOpen={setStateForConfirmationPopup}
          />
        </div>
      </form>

      {!isNaN(formData?.agencyId) && formData?.agencyId && (
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold align-middle flex-1">
              Bank Guarantee History
            </h2>
            {selectedRow &&
              (() => {
                const today = new Date();
                const validityFrom = selectedRow?.validity_from_date
                  ? new Date(selectedRow.validity_from_date)
                  : null;
                const validityTo = selectedRow?.validity_to_date
                  ? new Date(selectedRow.validity_to_date)
                  : null;

                const isWithinValidityPeriod =
                  validityFrom &&
                  validityTo &&
                  today >= validityFrom &&
                  today <= validityTo;

                return isWithinValidityPeriod ? (
                  <Button onClick={handleEdit} variant="default">
                    <Edit /> Edit
                  </Button>
                ) : null;
              })()}
            <CustomizedSelectInputWithLabel
              label="Export"
              placeholder="Export to"
              list={exportPicklist}
              value={exportType}
              onChange={(e) => handleExportFile(e.target.value)}
              containerClass=""
              disabled={exportLoading}
              hideLabel
            />
          </div>
          <ReactTable
            data={formatData}
            columns={columns}
            itemsPerPage={pageSize}
            dynamicPagination={true}
            pageNumber={currentPage}
            totalPageNumber={totalPages}
            onPageChange={handlePageChange}
            hideSearchAndOtherButtons
            isSelectable
            selectedRow={selectedRow}
            onRowSelect={handleRowSelection}
          />
        </div>
      )}
      <SuccessErrorModal
        isOpen={successErrorModalState?.isOpen}
        onClose={() =>
          setSuccessErrorModalState({
            isOpen: false,
            message: "",
            type: "success",
          })
        }
        message={successErrorModalState?.message}
        type={successErrorModalState?.type}
      />
    </AuthUserReusableCode>
  );
};

export default AgencySecurityDeposit;
