"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdatePosFormData, updatePosSchema } from "@/lib/zod";
import {
  addNewsNotice,
  deleteNewsById,
  getAllNewsList,
  getPosSerialNoDetails,
  updatePosSerialNoStatus,
  fetchPosDeviceReport,
  exportPosDeviceReport,
} from "@/app/api-calls/other/api";
import { toast } from "sonner";
import { formatDate, getErrorMessage, exportPicklist, tableDataPerPage } from "@/lib/utils";
import ReactTable from "@/components/ReactTable";
import SuccessErrorModal from "@/components/SuccessErrorModal";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";
import { Loader2 } from "lucide-react";
import { checkIfUserHasActionAccess } from "@/helper";
import { useSession } from "next-auth/react";
import { useForm as useFilterForm } from "react-hook-form";
import { zodResolver as filterZodResolver } from "@hookform/resolvers/zod";
import { posDeviceReportFilterSchema, PosDeviceReportFilterFormData } from "@/lib/zod";

const NewsNoticeForm = () => {
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdatePosFormData>({
    resolver: zodResolver(updatePosSchema),
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [posDeviceDetailsList, setPosDeviceDetailsList] = React.useState<any[]>(
    []
  );
  const [posDeviceList, setPosDeviceList] = useState([]);
  const [posDevicePage, setPosDevicePage] = useState(1);
  const [posDeviceTotalPages, setPosDeviceTotalPages] = useState(1);
  const [posDeviceExportType, setPosDeviceExportType] = useState("");

  const filterForm = useFilterForm<PosDeviceReportFilterFormData>({
    resolver: filterZodResolver(posDeviceReportFilterSchema),
    defaultValues: { pageSize: tableDataPerPage},
  });

  const { register: filterRegister, handleSubmit: handleFilterSubmit, formState: { errors: filterErrors }, setValue: setFilterValue } = filterForm;

  const onSubmit = async (data: UpdatePosFormData) => {
    setIsLoading(true);
    try {
      const response = await getPosSerialNoDetails(data?.deviceSerialNo);
      setValue(
        "deviceName",
        response?.data?.posDeviceDetails?.[0]?.device_model
      );
      setValue("mid", response?.data?.posDeviceDetails?.[0]?.mid);
      setValue("tid", response?.data?.posDeviceDetails?.[0]?.tid);
      setValue("deviceStatus", response?.data?.posDeviceDetails?.[0]?.status);
      setValue(
        "deviceSerial",
        response?.data?.posDeviceDetails?.[0]?.m_pos_device_serial_number
      );
      setPosDeviceDetailsList(response?.data?.posDetailRegisteredDeviceList);
      setShowButton(true);
    } catch (error) {
      toast.error("Error: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { label: "User ID", key: "user_id", sortable: true },
      { label: "Mobile No.", key: "mobile_number", sortable: true },
      { label: "Agent Name", key: "collector_name", sortable: true },
      { label: "Device ID", key: "device_id", sortable: true },
      { label: "Device Model", key: "model", sortable: true },
      { label: "Device Maker", key: "maker", sortable: true },
      { label: "Status", key: "display_status", sortable: true },
      { label: "Last Synced Date", key: "published_date", sortable: true },
    ],
    []
  );

  const formatData = posDeviceDetailsList.map((item) => ({
    ...item,
    display_status: item?.status === "true" ? "Active" : "Inactive",
    published_date: formatDate(item?.last_sync_date),
  }));

  const formData = watch();

  const handleUpdateDeviceStatus = async () => {
    setIsLoading(true);
    try {
      let payload = {
        serial_number: formData?.deviceSerial,
      };

      const response = await updatePosSerialNoStatus(payload);

      setPopupType("success");
      setErrorMessage("Updated Successfully!");
      setIsErrorModalOpened(true);
      reset();
      setShowButton(false);
    } catch (error) {
      setErrorMessage("Error: Failed to save the status!");
      setPopupType("error");
      setIsErrorModalOpened(true);
    } finally {
      setIsLoading(false);
    }
  };

  const [isErrorModalOpened, setIsErrorModalOpened] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [popupType, setPopupType] = useState("success");

  const [stateForConfirmationPopup, setStateForConfirmationPopup] =
    useState(false);
  const [showButton, setShowButton] = useState(false);

  const posDeviceColumns = [
    { label: "Serial Number", key: "serial_no" },
    { label: "Device Id", key: "device_id" },
    { label: "Bank Name", key: "bank_name" },
    { label: "Device Model", key: "device_model" },
    { label: "Device Maker", key: "device_maker" },
    { label: "Firmware Version", key: "firmware_version" },
    { label: "MID", key: "mid" },
    { label: "TID", key: "tid" },
    { label: "OS version", key: "os_version" },
    { label: "Registration Date", key: "registration_date" },
    { label: "Status", key: "status" },
  ];

  const filterFormData = filterForm.watch();

  const fetchReportData = async (filter={},page=1) => {
    setIsLoading(true);
    try {
      let payload = {
        page: posDevicePage,
        page_size: filterFormData?.pageSize,
      };

      payload = {
        ...payload,
        ...filter,
        page: page
      }

      const res = await fetchPosDeviceReport(payload);
      setPosDeviceList(res?.data?.data || []);
      setPosDevicePage(res?.data?.currentPage || 1)
      setPosDeviceTotalPages(res?.data?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch POS Device List: " + getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handlePosDeviceExport = async (type) => {
    setPosDeviceExportType(type);
    setIsLoading(true);
    try {
      const response = await exportPosDeviceReport(type);
      const contentDisposition = response.headers?.["content-disposition"];
      let filename = "POSDeviceList";
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches.length > 1) {
          filename = matches[1];
        }
      }
      let contentType = response.headers?.["content-disposition"];
      let extension = type;

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.includes(`.${extension}`) ? filename : `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Error downloading the report");
    } finally {
      setIsLoading(false);
      setPosDeviceExportType("");
    }
  };

  const handleFilterSubmitDeviceList = (data:any) => {
    fetchReportData({},1)
  }

  const handlePosDevicePageChange = (page) => {
    setPosDevicePage(page);
    fetchReportData({},page)
  };

  return (
    <AuthUserReusableCode
      pageTitle="Update POS Serial No"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <div className="col-span-2">
              <CustomizedInputWithLabel
                label="Device Serial No."
                type="text"
                {...register("deviceSerialNo")}
                errors={errors.deviceSerialNo}
              />
            </div>
            <div className="text-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </div>
          </div>

          <CustomizedInputWithLabel
            label="Device Name"
            errors={errors.deviceName}
            {...register("deviceName")}
            disabled
          />
          <CustomizedInputWithLabel
            label="MID"
            errors={errors.mid}
            {...register("mid")}
            disabled
          />
          <CustomizedInputWithLabel
            label="TID"
            errors={errors.tid}
            {...register("tid")}
            disabled
          />
          <CustomizedInputWithLabel
            label="Device serial"
            errors={errors.deviceSerial}
            {...register("deviceSerial")}
            disabled
          />
        </div>
      </form>

      {/* disabled={
                checkIfUserHasActionAccess(
                    {
                        backendScope: session?.user?.userScopes,
                        currentAction: 'disableVendorCode'
                    })} */}
      {checkIfUserHasActionAccess({
        backendScope: session?.user?.userScopes,
        currentAction: "enabledUpdatePos",
      }) && showButton ? (
        <>
          <div className="text-end mt-4">
            <AlertPopupWithState
              triggerCode={
                <Button
                  variant={
                    formData?.deviceStatus === "INACTIVE"
                      ? "default"
                      : "destructive"
                  }
                  onClick={handleSubmit((e) => {
                    setStateForConfirmationPopup(true);
                  })}
                >
                  {formData?.deviceStatus === "INACTIVE"
                    ? "Activate"
                    : "Deactivate"}
                </Button>
              }
              handleContinue={handleUpdateDeviceStatus}
              title={
                formData?.deviceStatus === "INACTIVE"
                  ? "Confirm activation"
                  : "Confirm deactivation"
              }
              description={
                formData?.deviceStatus === "INACTIVE"
                  ? "Are you sure you want to activate this POS serial number?"
                  : "Are you sure you want to deactive this POS serial number?"
              }
              continueButtonText="Yes"
              isOpen={stateForConfirmationPopup}
              setIsOpen={setStateForConfirmationPopup}
            />
          </div>
        </>
      ) : (
        <></>
      )}
      {showButton && (
        <div className="mt-4">
          <ReactTable
            data={formatData}
            columns={columns}
            hideSearchAndOtherButtons
          />
        </div>
      )}

      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">POS Device List</h3>
        <form onSubmit={handleFilterSubmit(handleFilterSubmitDeviceList)} className="flex gap-4 mb-4">
          <CustomizedInputWithLabel
            label="Page Size"
            type="number"
            {...filterRegister("pageSize",{valueAsNumber: true})}
            errors={filterErrors.pageSize}
          />
          <Button className="mt-6" type="submit">
            Search
          </Button>
          <CustomizedSelectInputWithLabel
            label="Export"
            placeholder="Export to"
            list={exportPicklist}
            value={posDeviceExportType}
            onChange={(e) => e.target.value && handlePosDeviceExport(e.target.value)}
            containerClass=""
          />
        </form>
        <div>
          <ReactTable
            data={posDeviceList}
            columns={posDeviceColumns}
            itemsPerPage={filterFormData?.pageSize}
            dynamicPagination={true}
            pageNumber={posDevicePage}
            totalPageNumber={posDeviceTotalPages}
            onPageChange={handlePosDevicePageChange}
            hideSearchAndOtherButtons
          />
        </div>
      </div>

      <SuccessErrorModal
        isOpen={isErrorModalOpened}
        onClose={() => setIsErrorModalOpened(false)}
        message={errorMessage}
        type={popupType}
      />
    </AuthUserReusableCode>
  );
};

export default NewsNoticeForm;
