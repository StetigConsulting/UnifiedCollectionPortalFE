"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supervisorDepositSchema, SupervisorDepositFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2 } from "lucide-react";
import {
  addSupervisorDeposit,
  uploadSupervisorDepositSlip,
} from "@/app/api-calls/agency/api";
import { getErrorMessage } from "@/lib/utils";
import { getAllBankList } from "@/app/api-calls/other/api";
import { useSession } from "next-auth/react";

const SupervisorDeposit = () => {
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SupervisorDepositFormData>({
    resolver: zodResolver(supervisorDepositSchema),
    defaultValues: {
      depositAmount: null,
      depositDate: "",
      txnRefNo: "",
      bank: "",
      depositSlip: null,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankList, setBankList] = useState([]);

  useEffect(() => {
    getBankList();
  }, []);

  const getBankList = async () => {
    setIsLoading(true);
    try {
      const response = await getAllBankList();
      let listOfBanks = response.data.map((current) => ({
        id: current.id,
        value: current.bankName,
        label: current.bankName,
      }));
      setBankList(listOfBanks);
    } catch (error) {
      console.error("Failed to get banks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SupervisorDepositFormData) => {
    const formData = new FormData();
    formData.append("file", data.depositSlip[0]);
    try {
      setIsSubmitting(true);
      const fileUploadResponse = await uploadSupervisorDepositSlip(formData);
      let payload = {
        supervisor_id: session?.user?.id,
        bank_name: data.bank,
        deposit_date: data.depositDate,
        amount: data.depositAmount,
        txn_ref_no: data.txnRefNo,
        deposit_slip_file_name: fileUploadResponse?.data?.filePath,
      };
      await addSupervisorDeposit(payload);
      toast.success("Supervisor Deposit added successfully");
      reset();
    } catch (error) {
      let errorMessage = getErrorMessage(error);
      toast.error("Error: " + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthUserReusableCode pageTitle="Supervisor Deposit" isLoading={isLoading}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CustomizedInputWithLabel
            label="Date"
            type="date"
            required={true}
            errors={errors.depositDate}
            {...register("depositDate")}
          />
          <CustomizedInputWithLabel
            label="Amount Deposited"
            type="number"
            required={true}
            errors={errors.depositAmount}
            {...register("depositAmount", { valueAsNumber: true })}
          />
          <CustomizedSelectInputWithLabel
            label="Bank"
            required={true}
            list={bankList}
            errors={errors.bank}
            {...register("bank")}
          />
          <CustomizedInputWithLabel
            label="Reference Number"
            required={true}
            errors={errors.txnRefNo}
            {...register("txnRefNo")}
          />
        </div>
        <div>
          <input
            type="file"
            accept="image/*,application/pdf"
            {...register("depositSlip")}
          />
          {errors.depositSlip &&
            typeof errors.depositSlip.message === "string" && (
              <span className="text-red-500">{errors.depositSlip.message}</span>
            )}
        </div>
        <div className="flex gap-4 mt-4 align-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <>
              <Loader2 className="animate-spin" /> Submitting
            </>
              : "Submit"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Cancel
          </Button>
        </div>
      </form>
    </AuthUserReusableCode>
  );
};

export default SupervisorDeposit;
