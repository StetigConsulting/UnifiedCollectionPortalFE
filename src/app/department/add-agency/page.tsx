"use client";

import {
  getAllNonEnergyTypes,
  getAllPaymentModes,
  getLevelsDiscomId,
} from "@/app/api-calls/department/api";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { addAgencySchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const [paymentModes, setPaymentMethods] = useState([]);
  const [nonEnergyTypes, setNonEnergyTypes] = useState([]);
  const [circles, setCircles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);

  // To store the previous form values
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
      .catch((err) => {});
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
            containerClass=""
            label="Agency Name"
            errors={errors.agencyName}
            placeholder="Enter Agency Name"
            {...register("agencyName")}
          />
          <CustomizedInputWithLabel
            containerClass="col-span-2"
            label="Vendor ID"
            errors={errors.vendorId}
            placeholder="Enter Vendor ID"
            {...register("vendorId")}
          />
          <CustomizedInputWithLabel
            containerClass="col-span-2"
            label="Registered Address"
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
            errors={errors.contactPerson}
            placeholder="Enter Contact Person"
            {...register("contactPerson")}
          />
          <CustomizedInputWithLabel
            containerClass=""
            label="Phone Number"
            errors={errors.phoneNumber}
            placeholder="Enter Phone Number"
            {...register("phoneNumber")}
          />
          <CustomizedInputWithLabel
            label="Maximum Limit"
            errors={errors.maximumLimit}
            containerClass=""
            placeholder="Enter Maximum Limit"
            {...register("maximumLimit")}
          />
          <CustomizedInputWithLabel
            label="Maximum Agent"
            errors={errors.maximumAgent}
            containerClass=""
            placeholder="Enter Maximum Agent"
            {...register("maximumAgent")}
          />
          <div className="grid grid-cols-3 gap-4 col-span-2">
            <CustomizedInputWithLabel
              label="Validity From Date"
              errors={errors.validityFromDate}
              containerClass=""
              placeholder="Choose Validity Date"
              type="date"
              {...register("validityFromDate")}
            />
            <CustomizedInputWithLabel
              label="Validity To Date"
              errors={errors.validityToDate}
              containerClass=""
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
            <CustomizedInputWithLabel
              label="Transaction ID"
              errors={errors.transactionId}
              containerClass=""
              placeholder="Enter Transaction ID"
              {...register("transactionId")}
            />
            <CustomizedInputWithLabel
              label="Initial Balance"
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
          </div>
          <CustomizedSelectInputWithLabel
            label="Circle"
            errors={errors.circle}
            containerClass=""
            placeholder="Select Circle Type"
            list={circles}
            {...register("circle")}
          />
          <CustomizedSelectInputWithLabel
            label="Division"
            errors={errors.division}
            containerClass=""
            placeholder="Select Division"
            list={divisions}
            {...register("division")}
          />
          <CustomizedSelectInputWithLabel
            label="Sub Division"
            errors={errors.subDivision}
            containerClass="col-span-2"
            placeholder="Select Sub Division"
            list={subDivisions}
            {...register("subDivision")}
          />
          <CustomizedInputWithLabel
            label="Permissions"
            errors={errors.permission}
            containerClass=""
            placeholder="Select Permissions"
            {...register("permission")}
          />
          <CustomizedInputWithLabel
            label="Collection Type"
            errors={errors.collectionType}
            containerClass=""
            placeholder="Select Collection Type"
            {...register("collectionType")}
          />
          <CustomizedInputWithLabel
            label="Non Energy"
            errors={errors.nonEnergy}
            containerClass=""
            placeholder="Select Non Energy"
            {...register("nonEnergy")}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" variant="default">
            Submit
          </Button>
        </div>
      </form>
    </AuthUserReusableCode>
  );
};

export default AddAgency;
