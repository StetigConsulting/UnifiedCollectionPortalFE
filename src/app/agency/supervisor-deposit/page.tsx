"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supervisorDepositSchema, SupervisorDepositFormData } from "@/lib/zod";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Loader2, Upload } from "lucide-react";
import {
  addSupervisorDeposit,
  uploadSupervisorDepositSlip,
} from "@/app/api-calls/agency/api";
import { getErrorMessage } from "@/lib/utils";
import { getAllBankList } from "@/app/api-calls/other/api";
import { useSession } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SuccessErrorModal from "@/components/SuccessErrorModal";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        supervisor_id: session?.user?.userId,
        bank_name: data.bank,
        deposit_date: data.depositDate,
        amount: data.depositAmount,
        txn_ref_no: data.txnRefNo,
        deposit_slip_file_name: fileUploadResponse?.data?.filePath,
      };
      await addSupervisorDeposit(payload);
      setErrorMessage("Supervisor Deposit added successfully");
      setErrorSuccessModalType('success');
      setIsSuccessModalOpen(true);
      reset();
    } catch (error) {
      let errorMessage = getErrorMessage(error);
      setErrorMessage(errorMessage);
      setErrorSuccessModalType('error');
      setIsSuccessModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isAllowed = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isAllowed) {
      toast.error('Only image or PDF files are allowed');
      setValue('depositSlip', null as any);
      setFileName('');
      return;
    }
    setValue('depositSlip', [file]);
    setFileName(file.name);
  };

  const handleUploadClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      setIsDialogOpen(false);
      toast.success('File selected for upload');
    }, 1000);
  };

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [errorSuccessModalType, setErrorSuccessModalType] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
            // required={true}
            list={bankList}
            errors={errors.bank}
            {...register("bank")}
          />
          <CustomizedInputWithLabel
            label="Reference Number"
            errors={errors.txnRefNo}
            {...register("txnRefNo")}
          />
        </div>
        <div>
          <Button type="button" onClick={handleUploadClick}>  <Upload size={24} /> Upload Deposit Slip Photo</Button>
          {errors.depositSlip &&
            typeof errors.depositSlip.message === "string" && (
              <p className="text-red-500 text-xs mt-1">{errors.depositSlip.message}</p>
            )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Upload Deposit Slip</DialogTitle>
                </DialogHeader>
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    id="file-upload"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                    <Upload size={24} />
                    <p className="text-sm text-gray-600">
                      Drag & drop files or <span className="text-blue-500">Browse</span>
                    </p>
                    <p className="text-xs text-gray-400">Only image or PDF format is supported, size limit 5MB</p>
                  </label>
                  {fileName && <p className="text-sm text-green-500 mt-2">{fileName}</p>}
                </div>
                <DialogFooter>
                  <div className="flex justify-end space-x-4">
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isUploading} type="button" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="button" variant="default" disabled={isUploading || !fileName} onClick={handleUpload}>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          {/* Hide the default file input */}
          <input
            type="file"
            accept="image/*,application/pdf"
            {...register("depositSlip")}
            style={{ display: 'none' }}
          />

        </div>
        <div className="mt-4 text-end">
          <Button type="button" variant="outline" onClick={() => reset()} className="mr-4">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <>
              <Loader2 className="animate-spin" /> Submitting
            </>
              : "Submit"}
          </Button>
        </div>
      </form>
      <SuccessErrorModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={errorMessage}
        type={errorSuccessModalType}
      />
    </AuthUserReusableCode>
  );
};

export default SupervisorDeposit;
