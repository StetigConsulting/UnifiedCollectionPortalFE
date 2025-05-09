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
import { getBillingDataUploadHistory, getDateComparisionData, getTransactionSummary } from "../api-calls/other/api";
import { toast } from "sonner";
import { formatDate, getErrorMessage } from "@/lib/utils";
import moment from "moment";
import { Chart } from "react-google-charts";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { checkIfUserHasActionAccess } from "@/helper";
import { getLevels } from "../api-calls/department/api";

type FormData = z.infer<typeof dashboardSchema>;

const dashboard = () => {
  const {
    register,
    clearErrors,
    setError,
    formState: { errors },
    watch, reset, getValues
  } = useForm<FormData>({
    resolver: zodResolver(dashboardSchema),
  });

  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmiting] = useState(false)

  const [showTable, setShowTable] = useState(false)

  const formData = watch()

  const [comparisionData, setComparisonData] = useState([])

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && errors[name]) {
        clearErrors(name);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, clearErrors, errors]);

  const getBillingUploadHistory = async () => {
    let date = getValues("fromDate")

    if (!date) {
      setError("fromDate", { type: "manual", message: "Date is required" });
      return
    }

    try {
      setIsSubmiting(true)
      let payload = {
        discom: session?.user?.discomId,
        date: getValues("fromDate"),
      }
      const response = await getBillingDataUploadHistory(payload)
      setTableData(response.data)
      setShowTable(true)

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
    formattedDate: moment(item.upload_date).format('DD/MM/YYYY, HH:mm:ss A')
  }));

  const mergeComparisionData = (date1Data = [], date2Data = [], date1Label = "Date 1", date2Label = "Date 2") => {
    const map = new Map();

    date1Data.forEach((item) => {
      const division = item.level_2_name;
      map.set(division, {
        label: division,
        [date1Label]: {
          transaction: item.no_of_transactions,
          sum: item.sum,
        },
      });
    });

    date2Data.forEach((item) => {
      const division = item.level_2_name;
      if (map.has(division)) {
        const existing = map.get(division);
        map.set(division, {
          ...existing,
          [date2Label]: {
            transaction: item.no_of_transactions,
            sum: item.sum,
          }
        });
      } else {
        map.set(division, {
          label: division,
          [date2Label]: {
            transaction: item.no_of_transactions,
            sum: item.sum,
          },
        });
      }
    });

    return Array.from(map.values());
  };

  const getComparisionData = async () => {
    const date1 = getValues('comparisionFromDate')
    const date2 = getValues('comparisionToDate');

    let hasError = false;

    if (!date1) {
      setError("comparisionFromDate", { type: "manual", message: "Date 1 is required" });
      hasError = true;
    }

    if (!date2) {
      setError("comparisionToDate", { type: "manual", message: "Date 2 is required" });
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsSubmiting(true)
      const responseDate1 = await getDateComparisionData(date1)
      const responseDate2 = await getDateComparisionData(date2)
      let data = mergeComparisionData(responseDate1?.data, responseDate2?.data, date1, date2)
      setComparisonData(data)
    } catch (e) {
      toast.error('Error: ' + getErrorMessage(e))
    }
    finally {
      setIsSubmiting(false)
    }
  };

  const createTooltipForPerformance = (count, sum) => {
    return `<div style="padding:5px; text-align:center; font-size:12px;">
    <p>No. of Transactions - ${count}</p>
    </div>`

    return `<div style="padding:5px; text-align:center; font-size:12px;">
    <p>No. of Transactions - ${count}</p>
    <p>No. of Meter Reader Logged in - ${sum}</p>
    </div>`
  }

  const formulateTheResponse = (list, date1, date2) => {
    const currentLabel = `${moment(date1).format('DD MMM, YYYY')}`;
    const previousLabel = `${moment(date2).format('DD MMM, YYYY')}`;
    const response = [[levelName + 's',
      currentLabel, { 'type': 'string', 'role': 'tooltip', 'p': { html: true } },
      previousLabel, { 'type': 'string', 'role': 'tooltip', 'p': { html: true } }]];

    list.forEach((item) => {
      response.push([
        item.label,
        item[date1]?.sum || 0,
        createTooltipForPerformance(item[date1]?.transaction, item[date1]?.sum),
        item[date2]?.sum || 0,
        createTooltipForPerformance(item[date2]?.transaction, item[date2]?.sum),
      ]);
    });
    return response;
  };

  const getComparisonChartOptions = (date1, date2) => ({
    // title: `Disomwise Performance`,
    tooltip: { isHtml: true },
    hAxis: {
      title: levelName,
      titleTextStyle: { italic: true, fontSize: 12 },
      textStyle: { fontSize: 12 },
    },
    vAxis: {
      title: 'Amount',
      viewWindow: {
        min: 0,
      },
      titleTextStyle: { italic: true, fontSize: 12 },
      textStyle: { fontSize: 12 },
      gridlines: { color: 'transparent' },
      format: 'short',
    },
    bar: { groupWidth: '50%' },
    chartArea: { width: '70%', height: '70%' },
    series: {
      0: { color: '#81ea81' },
      1: { color: '#c95d5d' },
    },
    backgroundColor: 'transparent',
  });

  const [transactionData, setTransactionData] = useState([])

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { label: "January", value: "01" },
    { label: "February", value: "02" },
    { label: "March", value: "03" },
    { label: "April", value: "04" },
    { label: "May", value: "05" },
    { label: "June", value: "06" },
    { label: "July", value: "07" },
    { label: "August", value: "08" },
    { label: "September", value: "09" },
    { label: "October", value: "10" },
    { label: "November", value: "11" },
    { label: "December", value: "12" },
  ];

  const mergeTransactionData = (currentData, previousData) => {
    const map = new Map();

    currentData.forEach((item) => {
      const date = moment(item.upload_date).format("Do");
      map.set(date, {
        upload_date: date,
        current_no_of_transaction: item.no_of_transaction,
        current_sum: item.sum,
      });
    });

    previousData.forEach((item) => {
      const date = moment(item.upload_date).format("Do");
      const existing = map.get(date);

      map.set(date, {
        ...existing,
        upload_date: date,
        previous_no_of_transaction: item.no_of_transaction,
        previous_sum: item.sum,
      });
    });

    return Array.from(map.values());
  };


  const getPerformanceSummaryForRange = async () => {
    const {
      currentMonth,
      currentYear,
      previousMonth,
      previousYear,
    } = getValues();

    let hasError = false;

    if (!currentMonth) {
      setError("currentMonth", { type: "manual", message: "Current month is required" });
      hasError = true;
    }

    if (!currentYear) {
      setError("currentYear", { type: "manual", message: "Current year is required" });
      hasError = true;
    }

    if (!previousMonth) {
      setError("previousMonth", { type: "manual", message: "Previous month is required" });
      hasError = true;
    }

    if (!previousYear) {
      setError("previousYear", { type: "manual", message: "Previous year is required" });
      hasError = true;
    }

    if (hasError) return;

    const curr = new Date(`${currentYear}-${currentMonth}-01`);
    const prev = new Date(`${previousYear}-${previousMonth}-01`);

    // if (curr > prev) {
    //   setError("currentMonth", {
    //     type: "manual",
    //     message: "Current period must not be earlier than Previous",
    //   });
    //   return;
    // }

    try {
      setIsSubmiting(true)
      const responseDate1 = await getTransactionSummary({
        month: getValues("currentMonth"),
        year: getValues("currentYear")
      })
      const responseDate2 = await getTransactionSummary({
        month: getValues("previousMonth"),
        year: getValues("previousYear")
      })

      let data = mergeTransactionData(responseDate1?.data, responseDate2?.data)
      setTransactionData(data)
    } catch (e) {
      toast.error('Error: ' + getErrorMessage(e))
    }
    finally {
      setIsSubmiting(false)
    }
  };

  const [levelName, setLevelName] = useState('')

  const getWorkingLevel = async () => {
    setIsLoading(true)
    await getLevels(session?.user?.discomId).then((data) => {
      let newData = data?.data.filter((item) => (item.levelType === "MAIN" && item?.level === 2))
      let levelName = newData?.[0]?.levelName;
      if (levelName) {
        levelName = levelName.charAt(0).toUpperCase() + levelName.slice(1).toLowerCase();
      }
      setLevelName(levelName)
    })
    setIsLoading(false)
  }

  const createTooltipForTransaction = (transaction) => {
    return `<div style="padding:5px; text-align:center; font-size:12px;">
    No. of Transactions - ${transaction}
    </div>`
  }

  const formulateTheTransactionResponse = (list) => {
    const currentLabel = `${moment(formData?.currentMonth, 'MM').format('MMMM')} ${formData?.currentYear}`;
    const previousLabel = `${moment(formData?.previousMonth, 'MM').format('MMMM')} ${formData?.previousYear}`;
    const response = [["Date", currentLabel, { 'type': 'string', 'role': 'tooltip', 'p': { html: true } }, previousLabel, { 'type': 'string', 'role': 'tooltip', 'p': { html: true } }]];
    list.forEach(item => {
      response.push([
        item.upload_date,
        item.current_sum || 0,
        createTooltipForTransaction(item.current_no_of_transaction || 0),
        item.previous_sum || 0,
        createTooltipForTransaction(item.previous_no_of_transaction || 0),
      ]);
    });

    return response;
  };

  const transactionChartOption = (currentLabel, previousLabel) => ({
    // title: `Transactions Summary`,
    // title: `Transaction Summary: ${currentLabel} vs ${previousLabel}`,
    tooltip: { isHtml: true },
    bars: 'vertical',
    hAxis: {
      title: 'Date',
      titleTextStyle: { italic: true, fontSize: 12 },
      textStyle: { fontSize: 12 },
    },
    // legend: 'none',
    vAxis: {
      title: 'Amount',
      titleTextStyle: { italic: true, fontSize: 12 },
      textStyle: { fontSize: 12 },
      format: 'short',
      gridlines: { color: 'transparent' },
      viewWindow: {
        min: 0,
      },
    },
    bar: { groupWidth: '50%' },
    chartArea: { width: '70%', height: '70%' },
    series: {
      0: { color: '#81ea81' },
      1: { color: '#c95d5d' },
    },
    backgroundColor: 'transparent',
  })

  useEffect(() => {
    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "day").format("YYYY-MM-DD");

    const currentMonth = moment().format("MM");
    const currentYear = moment().format("YYYY");

    const previousMonth = moment().subtract(1, "month").format("MM");
    const previousYear = moment().subtract(1, "month").format("YYYY");

    reset({
      comparisionFromDate: yesterday,
      comparisionToDate: today,
      currentMonth,
      currentYear,
      previousMonth,
      previousYear,
      fromDate: today,
    });

    fetchAllDataWithDefaultValues()
  }, [])

  const fetchAllDataWithDefaultValues = async () => {
    await getWorkingLevel()
    checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardTransactionSummary" }) &&
      await getPerformanceSummaryForRange()
    checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardPerformanceSummary" }) &&
      await getComparisionData()
    checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardBillUploadHistory" }) &&
      await getBillingUploadHistory()
  }

  return (
    <AuthUserReusableCode pageTitle="Dashboard" isLoading={isLoading || isSubmitting}>
      <div className="">
        {checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardTransactionSummary" }) &&
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="text-center text-xl font-semibold text-gray-800">
              Transactions Summary
            </div>
            <div className="flex gap-4">
              <h1>Current vs Previous</h1>
            </div>
            <div className="col-span-2 flex gap-4 mt-4">
              <CustomizedSelectInputWithLabel
                label="Current Month"
                containerClass="flex-1"
                errors={errors.currentMonth}
                {...register("currentMonth")}
                list={months}
              />
              <CustomizedSelectInputWithLabel
                label="Current Year"
                containerClass="flex-1"
                errors={errors.currentYear}
                {...register("currentYear")}
                list={years.map((y) => ({ label: y.toString(), value: y.toString() }))}
              />
              <CustomizedSelectInputWithLabel
                label="Previous Month"
                containerClass="flex-1"
                errors={errors.previousMonth}
                {...register("previousMonth")}
                list={months}
              />
              <CustomizedSelectInputWithLabel
                label="Previous Year"
                containerClass="flex-1"
                errors={errors.previousYear}
                {...register("previousYear")}
                list={years.map((y) => ({ label: y.toString(), value: y.toString() }))}
              />

              <div className={`self-end 
                ${(errors.previousMonth || errors.previousYear || errors.currentMonth || errors.currentYear) ? 'mb-5' : ''} text-end`}>
                <Button variant="default" onClick={getPerformanceSummaryForRange}>
                  Search
                </Button>
              </div>
            </div>
            {transactionData.length > 0 ? <>
              <div className="w-full h-[400px]">
                <Chart
                  chartType="ColumnChart"
                  data={formulateTheTransactionResponse(transactionData)}
                  options={transactionChartOption(
                    `${formData?.currentMonth}/${formData?.currentYear}`,
                    `${formData?.previousMonth}/${formData?.previousYear}`
                  )}
                  graph_id="Transaction_Comparision"
                  width="100%"
                  height="400px"
                />
              </div>
            </> : <div className="p-4 mt-4 bg-white">No Data Found</div>}
          </div>}

        {checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardPerformanceSummary" }) &&
          <div className="bg-gray-100 p-4 rounded-md gap-4 mt-4">
            {levelName &&
              <div className="text-center text-xl font-semibold text-gray-800">
                {levelName}wise Summary
              </div>
            }
            <div className="flex gap-4">
              <h1>Select 2 Dates for Comparision</h1>
            </div>
            <div className="col-span-2 flex gap-4 mt-4">
              <CustomizedInputWithLabel
                {...register("comparisionFromDate")}
                errors={errors.comparisionFromDate}
                containerClass="flex-1"
                label="Date 1"
                type="date"
              />
              <CustomizedInputWithLabel
                {...register("comparisionToDate")}
                errors={errors.comparisionToDate}
                containerClass="flex-1"
                label="Date 2"
                type="date"
              />
              <div className={`self-end ${errors.comparisionFromDate || errors.comparisionToDate ? 'mb-5' : ''} text-end`}>
                <Button variant="default" onClick={getComparisionData}>
                  Search
                </Button>
              </div>
            </div>
            {comparisionData.length > 0 ? <>

              <div className="w-full h-[400px]">
                <Chart
                  chartType="ColumnChart"
                  data={formulateTheResponse(comparisionData, formData?.comparisionFromDate, formData?.comparisionToDate)}
                  options={getComparisonChartOptions(formData?.comparisionFromDate, formData?.comparisionToDate)}
                  graph_id="Date_Comparision"
                  width="100%"
                  height="400px"
                />
              </div>
            </> : <div className="p-4 mt-4 bg-white">No Data Found</div>}
          </div>
        }

        {checkIfUserHasActionAccess({ backendScope: session?.user?.userScopes, currentAction: "dashboardBillUploadHistory" }) &&
          <div className="bg-gray-100 p-4 rounded-md mt-4">
            <p className="text-2xl text-center">Billing Data Upload History</p>
            <div className="col-span-2 flex gap-4 mt-4">
              <CustomizedInputWithLabel
                {...register("fromDate")}
                errors={errors.fromDate}
                containerClass="flex-1"
                label="Date"
                type="date"
              />
              <div className={`self-end ${errors.fromDate ? 'mb-5' : ''} text-end`}>
                <Button variant="default" onClick={getBillingUploadHistory}>
                  Search
                </Button>
              </div>
            </div>
            {
              (showTable) &&
              <div className="mt-4">
                <ReactTable
                  data={structureTableData}
                  columns={columns}
                  hideSearchAndOtherButtons
                />
              </div>
            }
          </div>
        }

      </div>
    </AuthUserReusableCode >
  );
};

export default dashboard;
