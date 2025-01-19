"use client";

import {
  createAgency,
  getAllNonEnergyTypes,
  getAllPaymentModes,
  getLevelsDiscomId,
} from "@/app/api-calls/department/api";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedCheckboxGroupWithLabel from "@/components/CustomizedCheckboxGroupWithLabel";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { AgencyDataInterface } from "@/lib/interface";
import { addAgencySchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof addAgencySchema>;

const AddAgency = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(addAgencySchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    const agencyData: AgencyDataInterface = {
      discomId: 12345,
      agencyName: data.agencyName,
      agencyAddress: data.registeredAddress,
      workOrderNumber: data.woNumber || "",
      emailId: data.email || "",
      contactPerson: data.contactPerson,
      maximumAmount: data.maximumLimit || 0,
      phone: data.phoneNumber || "",
      maxAgent: data.maximumAgent || 0,
      startDate: data.validityFromDate,
      endDate: data.validityToDate,
      recordStatus: "ACTIVE",
      currentBalance: data.initialBalance || 0,
      validity: data.validityToDate,
      circleCode: data.circle,
      divCode: data.division,
      permissionPaymentMethodId: data.permission.join(","), // Assuming permissions are an array
      sStatus: "ACTIVE",
      energy: data.collectionType.includes("Energy") ? "Energy info" : null,
      nonEnergyId: "",
      agencyType: "Type1",
      vendorId: data.vendorId || "",
      workLevel: data.workingLevel || "",
    };

    try {
      setIsSubmitting(true);
      const response = await createAgency(agencyData);
      toast.success("Agency created successfully");
      console.log("API Response:", response);
    } catch (error) {
      toast.error("Failed to create agency. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

  };

  const [paymentModes, setPaymentMethods] = useState([]);
  const [nonEnergyTypes, setNonEnergyTypes] = useState([]);
  const [circles, setCircles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);

  const previousValuesRef = useRef<FormData | null>(null);

  const formData = watch();

  useEffect(() => {
    if (previousValuesRef.current) {
      const changes = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== previousValuesRef.current[key]) {
          acc[key] = {
            old: previousValuesRef.current[key],
            new: formData[key],
          };
        }
        return acc;
      }, {} as Record<string, { old: any; new: any }>);

      if (Object.keys(changes).length > 0) {
        console.log("Changes detected:", changes);
        if (Object.keys(changes).includes("circle")) {
          let newValue = changes["circle"];
          if (newValue?.new) {
            getDivisions(newValue?.new);
          }
        }

        if (Object.keys(changes).includes("division")) {
          let newValue = changes["division"];
          if (newValue?.new) {
            getSubDivisions(newValue?.new);
          }
        }
      }
    }
    previousValuesRef.current = formData;
  }, [formData]);

  useEffect(() => {
    getAllPaymentModes()
      .then((data) => {
        setPaymentMethods(
          data?.data
            ?.filter((ite) => ite.mode_type == "Security Deposit")
            ?.map((ite) => {
              return {
                label: ite.mode_name,
                value: ite.id,
              };
            })
        );
        setPermissions(
          data?.data
            ?.filter((ite) => ite.mode_type == "Collection")
            ?.map((ite) => {
              return {
                label: ite.mode_name,
                value: ite.id,
              };
            })
        );
      })
      .catch((err) => { });
    getAllNonEnergyTypes().then((data) => {
      setNonEnergyTypes(
        data?.data?.map((ite) => {
          return {
            label: ite.type_name,
            value: ite.id,
          };
        })
      );
    });
    getLevelsDiscomId("1001").then((data) => {
      setCircles(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    });
  }, []);

  const getDivisions = (id) => {
    getLevelsDiscomId(id).then((data) => {
      setDivisions(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    });
  };

  const getSubDivisions = (id) => {
    getLevelsDiscomId(id).then((data) => {
      setSubDivisions(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    });
  };

  return (
    <AuthUserReusableCode pageTitle="Add Agency">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CustomizedInputWithLabel
            containerClass="col-span-2"
            label="Agency Name"
            required={true}
            errors={errors.agencyName}
            placeholder="Enter Agency Name"
            {...register("agencyName")}
          />
          <CustomizedInputWithLabel
            containerClass="col-span-2"
            label="Registered Address"
            required={true}
            errors={errors.registeredAddress}
            placeholder="Enter Registered Address"
            {...register("registeredAddress")}
          />
          <CustomizedInputWithLabel
            containerClass=""
            label="WO Number"
            errors={errors.woNumber}
            placeholder="Enter WO Number"
            {...register("woNumber")}
          />
          <CustomizedInputWithLabel
            containerClass=""
            label="Email"
            errors={errors.email}
            placeholder="Enter Email Address"
            {...register("email")}
          />
          <CustomizedInputWithLabel
            containerClass=""
            label="Contact Person"
            required={true}
            errors={errors.contactPerson}
            placeholder="Enter Contact Person"
            {...register("contactPerson")}
          />
          <CustomizedInputWithLabel
            containerClass=""
            label="Phone Number"
            required={true}
            errors={errors.phoneNumber}
            placeholder="Enter Phone Number"
            {...register("phoneNumber")}
          />
          <CustomizedInputWithLabel
            label="Maximum Limit"
            errors={errors.maximumLimit}
            required={true}
            type="number"
            containerClass=""
            placeholder="Enter Maximum Limit"
            {...register("maximumLimit")}
          />
          <CustomizedInputWithLabel
            label="Maximum Agent"
            errors={errors.maximumAgent}
            containerClass=""
            type='number'
            required={true}
            placeholder="Enter Maximum Agent"
            {...register("maximumAgent")}
          />
          <div className="grid grid-cols-3 gap-4 col-span-2">
            <CustomizedInputWithLabel
              label="Validity From Date"
              errors={errors.validityFromDate}
              containerClass=""
              required={true}
              placeholder="Choose Validity Date"
              type="date"
              {...register("validityFromDate")}
            />
            <CustomizedInputWithLabel
              label="Validity To Date"
              errors={errors.validityToDate}
              containerClass=""
              required={true}
              placeholder="Choose Validity Date"
              type="date"
              {...register("validityToDate")}
            />
            <CustomizedInputWithLabel
              label="Payment Date"
              errors={errors.paymentDate}
              containerClass=""
              placeholder="Choose Payment Date"
              type="date"
              {...register("paymentDate")}
            />
          </div>
          <CustomizedInputWithLabel
            label="Transaction ID"
            errors={errors.transactionId}
            containerClass=""
            placeholder="Enter Transaction ID"
            {...register("transactionId")}
          />
          <CustomizedInputWithLabel
            label="Initial Balance"
            required={true}
            errors={errors.initialBalance}
            containerClass=""
            placeholder="Enter Initial Balance"
            {...register("initialBalance")}
          />
          <CustomizedSelectInputWithLabel
            label="Payment Mode"
            errors={errors.paymentMode}
            containerClass=""
            list={paymentModes}
            placeholder="Select Payment Mode"
            {...register("paymentMode")}
          />
          <CustomizedInputWithLabel
            label="Payment Remark"
            errors={errors.paymentRemark}
            containerClass=""
            placeholder="Enter Payment Remark"
            {...register("paymentRemark")}
          />
          <CustomizedSelectInputWithLabel
            label="Circle"
            errors={errors.circle}
            required={true}
            containerClass=""
            placeholder="Select Circle Type"
            list={circles}
            {...register("circle")}
          />
          <CustomizedSelectInputWithLabel
            label="Division"
            errors={errors.division}
            containerClass=""
            required={true}
            placeholder="Select Division"
            list={divisions}
            {...register("division")}
          />
          <CustomizedSelectInputWithLabel
            label="Working Level"
            errors={errors.workingLevel}
            containerClass=""
            required={true}
            placeholder="Select Working level"
            list={divisions}
            {...register("workingLevel")}
          />
          <CustomizedInputWithLabel
            label="VendorID"
            errors={errors.vendorId}
            containerClass=""
            placeholder="Enter vendor ID"
            {...register("vendorId")}
          />
          <CustomizedSelectInputWithLabel
            label="Sub Division"
            errors={errors.subDivision}
            containerClass="col-span-2"
            placeholder="Select Sub Division"
            list={subDivisions}
            required={true}
            {...register("subDivision")}
          />
          <CustomizedCheckboxGroupWithLabel
            label="Permissions"
            options={permissions}
            required={true}
            errors={errors.permission}
            register={register('permission')}
          />

          <CustomizedCheckboxGroupWithLabel
            label="Collection Type"
            options={[
              { label: 'Energy', value: 'Energy' },
              { label: 'Non-Energy', value: 'Non-Energy' },
            ]}
            required={true}
            errors={errors.collectionType}
            register={register('collectionType')}
          />

          {(formData?.collectionType &&
            formData?.collectionType?.includes("Non-Energy")) ?
            (
              <CustomizedCheckboxGroupWithLabel
                label="Non Energy"
                containerClass="col-span-2"
                options={nonEnergyTypes}
                required={true}
                errors={errors.nonEnergy}
                register={register("nonEnergy")}
              />
            ) : <></>}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </AuthUserReusableCode>
  );
};

export default AddAgency;
