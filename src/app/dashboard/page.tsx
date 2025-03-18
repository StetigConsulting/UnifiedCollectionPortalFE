"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import ReactTable from "@/components/ReactTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getBillingDataUploadHistory } from "../api-calls/other/api";
import { toast } from "sonner";
import { formatDate, getErrorMessage } from "@/lib/utils";
import moment from "moment";

type FormData = z.infer<typeof dashboardSchema>;

const dashboard = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>({
    resolver: zodResolver(dashboardSchema),
  });

  const { data: session } = useSession();

  const [isloading, setIsloading] = useState(false)
  const [isSubmitting, setIsSubmiting] = useState(false)

  const [showTable, setShowTable] = useState(false)

  const formData = watch()

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmiting(true)
      let payload = {
        discom: session?.user?.discomId,
        date: formData.fromDate
      }
      const response = await getBillingDataUploadHistory(payload)
      setTableData(response.data)
      setShowTable(true)
      console.log(response)
    } catch (e) {
      toast.error('Error: ' + getErrorMessage(e))
    }
    finally {
      setIsSubmiting(false)
    }
  };

  const columns = useMemo(() => [
    { label: 'Job ID', key: 'job_id', sortable: true },
    { label: 'Uploaded Date', key: 'formattedDate', sortable: true },
    { label: 'File name', key: 'file_name', sortable: true },
    { label: 'Number of Records', key: 'no_of_records', sortable: true },
    { label: 'Records Posted Into CollectionBE', key: 'records_posted_db', sortable: true },
    { label: 'Records Posted Into Staging', key: 'records_posted_staging', sortable: true },
    { label: 'Status', key: 'status', sortable: true },
    { label: 'Remarks', key: 'remarks', sortable: true },
  ], []);

  const [tableData, setTableData] = useState([])

  const structureTableData = tableData.map((item, index) => ({
    ...item,
    formattedDate: moment(item.uploaded_date).format('DD/MM/YYYY, HH:mm:ss A')
  }));

  return (
    <AuthUserReusableCode pageTitle="Dashboard" isLoading={isloading || isSubmitting}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4 mb-4"
      >
        <div className="col-span-2 flex gap-4">
          <CustomizedInputWithLabel
            {...register("fromDate")}
            errors={errors.fromDate}
            containerClass="flex-1"
            label="Date"
            type="date"
          />
          <div className={`self-end ${errors.fromDate ? 'mb-4' : 'mb-2'} text-end`}>
            <Button variant="default" type="submit">
              Search
            </Button>
          </div>
        </div>
      </form>
      {
        (showTable) &&
        <ReactTable
          data={structureTableData}
          columns={columns}
          hideSearchAndOtherButtons
        />
      }

    </AuthUserReusableCode>
  );
};

export default dashboard;
