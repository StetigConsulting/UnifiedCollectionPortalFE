"use client";

import {
  createAgency,
  getAllNonEnergyTypes,
  getAllPaymentModes,
  getLevels,
  getLevelsDiscomId,
} from "@/app/api-calls/department/api";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import CustomizedMultipleSelectInputWithLabel from "@/components/CustomizedMultipleSelectInputWithLabelNumber";
import CustomizedMultipleSelectInputWithLabelString from "@/components/CustomizedMultipleSelectInputWithLabelString";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { Button } from "@/components/ui/button";
import { AgencyDataInterface } from "@/lib/interface";
import { getErrorMessage } from "@/lib/utils";
import { addAgencySchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type FormData = z.infer<typeof addAgencySchema>;

const AddAgency = () => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.userId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(addAgencySchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    console.log("Form Data:", data);
    const agencyData: AgencyDataInterface = {
      user_id: currentUserId,
      discom_id: session?.user?.discomId,
      agency_name: data.agencyName,
      agency_address: data.registeredAddress,
      wo_number: data.woNumber || "",
      email_id: data.email || "",
      contact_person: data.contactPerson,
      phone: data.phoneNumber || "",
      maximum_limit: data.maximumLimit || 0,
      max_agent: data.maximumAgent || 0,
      validity_from_date: data.validityFromDate,
      validity_to_date: data.validityToDate,
      payment_date: data.paymentDate || "",
      transaction_id: data.transactionId || "",
      security_deposit_payment_mode: Number(data.paymentMode) || undefined,
      payment_remarks: data.paymentRemark || "",
      collection_payment_modes: data.permission.map(Number),
      working_level: Number(data.workingLevel),
      vendor_id: data.vendorId || "",
      collection_type_energy: data.collectionType.includes("Energy"),
      collection_type_non_energy: data.collectionType.includes("Non-Energy"),
      is_active: true,
      non_energy_types: data.collectionType.includes("Non-Energy")
        ? data.nonEnergy.map(Number)
        : undefined,
      working_level_offices: data.workingLevel === levelNameMappedWithId.CIRCLE
        ? data.circle.map(Number)
        : data.workingLevel === levelNameMappedWithId.DIVISION
          ? data.division.map(Number)
          : data.workingLevel === levelNameMappedWithId.SUB_DIVISION
            ? data.subDivision.map(Number)
            : data.workingLevel === levelNameMappedWithId.SECTION ? data.section.map(Number) : [],
    };

    try {
      setIsSubmitting(true);
      const response = await createAgency(agencyData);
      toast.success("Agency created successfully");
      console.log("API Response:", response);
      location.reload();
    } catch (error) {
      console.error("Failed to create agency:", Object.keys(error.data)
        .map((key) => error.data[key])
        .join(', '));
      let errorMessage = getErrorMessage(error);
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false);
    }
  };

  const [paymentModes, setPaymentMethods] = useState([]);
  const [nonEnergyTypes, setNonEnergyTypes] = useState([]);
  const [circles, setCircles] = useState([]);
  const [workingLevel, setWorkingLevel] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subDivisions, setSubDivisions] = useState([]);
  const [sections, setSections] = useState([]);

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
        if (Object.keys(changes).includes("workingLevel")) {
          console.log('i  min')
          let newValue = changes["workingLevel"];
          if (newValue?.new) {
            setValue("circle", []);
            setValue("division", []);
            setValue("subDivision", []);
            setValue("section", []);
            setDivisions([]);
            setSubDivisions([]);
            setSections([]);
          }
        }
        if (Object.keys(changes).includes("circle")) {
          let newValue = changes["circle"];
          setValue("division", []);
          setValue("subDivision", []);
          setValue("section", []);
          setDivisions([]);
          setSubDivisions([]);
          setSections([]);
          if (newValue?.new?.length > 0 && formData.workingLevel !== levelNameMappedWithId.CIRCLE) {
            getDivisions(newValue?.new[0]);
          }
        }

        if (Object.keys(changes).includes("division")) {
          let newValue = changes["division"];
          setValue("subDivision", []);
          setValue("section", []);
          setSubDivisions([]);
          setSections([]);
          if (newValue?.new.length > 0 && (formData.workingLevel === levelNameMappedWithId.SUB_DIVISION || formData.workingLevel === levelNameMappedWithId.SECTION)) {
            getSubDivisions(newValue?.new[0]);
          }
        }

        if (Object.keys(changes).includes("subDivision")) {
          let newValue = changes["subDivision"];
          setValue("section", []);
          setSections([]);
          if (newValue?.new.length > 0 && formData.workingLevel === levelNameMappedWithId.SECTION) {
            getSections(newValue?.new[0]);
          }
        }
      }
    }
    previousValuesRef.current = formData;
  }, [formData]);

  useEffect(() => {
    getWorkingLevel()
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
      .catch((err) => { })
    getAllNonEnergyTypes().then((data) => {
      setNonEnergyTypes(
        data?.data?.map((ite) => {
          return {
            label: ite.type_name,
            value: ite.id,
          };
        })
      );
    })
    getLevelsDiscomId(session?.user?.discomId).then((data) => {
      setCircles(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    })

    getLevels(session?.user?.discomId).then((data) => {
      setWorkingLevel(
        data?.data
          ?.filter((ite) => ite.levelType == "MAIN")
          ?.map((ite) => {
            return {
              value: ite.id,
              label: ite.levelName,
            };
          })
      );
    })

    setValue('initialBalance', 0);
  }, []);

  const getDivisions = (id) => {
    setIsLoading(true)
    getLevelsDiscomId(id).then((data) => {
      setDivisions(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    }).finally(() => { setIsLoading(false); });
  };

  const getSubDivisions = (id) => {
    setIsLoading(true)
    getLevelsDiscomId(id).then((data) => {
      setSubDivisions(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    }).finally(() => { setIsLoading(false); })
  };

  const getSections = (id) => {
    setIsLoading(true)
    getLevelsDiscomId(id).then((data) => {
      setSections(
        data?.data?.officeStructure?.map((ite) => {
          return {
            value: ite.id,
            label: ite.office_description,
          };
        })
      );
    }).finally(() => { setIsLoading(false); });
  };

  const [levelNameMappedWithId, setLevelNameMappedWithId] = useState<Record<string, number>>({})

  const getWorkingLevel = () => {
    getLevels(session?.user?.discomId).then((data) => {
      let levelIdMap = data?.data
        ?.filter((item) => item.levelType === "MAIN")
        .reduce((acc, item) => {
          let levelName = item.levelName.replace(' ', "_");
          acc[levelName] = item.id;
          return acc;
        }, {});

      console.log(levelIdMap)
      setLevelNameMappedWithId(levelIdMap)
    })
  }

  return (
    <AuthUserReusableCode pageTitle="Add Agency" isLoading={isLoading}>
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
            type="number"
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
            disabled
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
            label="Working Level"
            errors={errors.workingLevel}
            containerClass=""
            required={true}
            placeholder="Select Working level"
            list={workingLevel}
            {...register("workingLevel")}
          />
          {formData.workingLevel &&
            <CustomizedMultipleSelectInputWithLabel
              label="Circle"
              errors={errors.circle}
              required={true}
              list={circles}
              placeholder="Select Circle Type"
              value={watch('circle') || []}
              onChange={(selectedValues) => setValue('circle', selectedValues)}
              multi={formData.workingLevel == levelNameMappedWithId.CIRCLE}
            />
          }
          {formData.workingLevel && formData.workingLevel != levelNameMappedWithId.CIRCLE && (
            <CustomizedMultipleSelectInputWithLabel
              label="Division"
              required={true}
              list={divisions}
              disabled={formData?.circle?.length == 0}
              value={watch('division') || []}
              onChange={(selectedValues) => setValue('division', selectedValues)}
              multi={formData.workingLevel == levelNameMappedWithId.DIVISION}
              errors={errors.division}
            />
          )}
          {
            formData.workingLevel && (formData.workingLevel == levelNameMappedWithId.SECTION
              || formData.workingLevel == levelNameMappedWithId.SUB_DIVISION) && (
              <CustomizedMultipleSelectInputWithLabel
                label="Sub Division"
                errors={errors.subDivision}
                placeholder="Select Sub Division"
                list={subDivisions}
                required={true}
                disabled={formData?.division?.length == 0}
                value={watch('subDivision') || []}
                multi={formData.workingLevel == levelNameMappedWithId.SUB_DIVISION}
                onChange={(selectedValues) => setValue('subDivision', selectedValues)}
              />
            )
          }
          {
            formData.workingLevel && formData.workingLevel == levelNameMappedWithId.SECTION && (
              <CustomizedMultipleSelectInputWithLabel
                label="Section"
                errors={errors.section}
                placeholder="Select Section"
                list={sections}
                required={true}
                disabled={formData?.subDivision?.length == 0}
                value={watch('section') || []}
                multi={formData.workingLevel == levelNameMappedWithId.SECTION}
                onChange={(selectedValues) => setValue('section', selectedValues)}
              />
            )
          }
          <CustomizedInputWithLabel
            label="VendorID"
            errors={errors.vendorId}
            containerClass=""
            placeholder="Enter vendor ID"
            {...register("vendorId")}
          />
          <CustomizedMultipleSelectInputWithLabel
            label="Permissions"
            errors={errors.permission}
            placeholder="Select permission"
            list={permissions}
            required={true}
            value={watch('permission') || []}
            multi={true}
            onChange={(selectedValues) => setValue('permission', selectedValues)}
          />
          <CustomizedMultipleSelectInputWithLabelString
            label="Collection Type"
            errors={errors.collectionType}
            placeholder="Select Collection"
            list={[
              { label: "Energy", value: "Energy" },
              { label: "Non-Energy", value: "Non-Energy" },
            ]}
            required={true}
            value={watch('collectionType') || []}
            multi={true}
            onChange={(selectedValues) => setValue('collectionType', selectedValues)}
          />

          {formData?.collectionType &&
            formData?.collectionType?.includes("Non-Energy") ? (
            <CustomizedMultipleSelectInputWithLabel
              label="Non Energy"
              list={nonEnergyTypes}
              required={true}
              errors={errors.nonEnergy}
              value={watch('nonEnergy') || []}
              multi={true}
              onChange={(selectedValues) => setValue('nonEnergy', selectedValues)}
            />
          ) : (
            <></>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </> : "Submit"}
          </Button>
        </div>
      </form>
    </AuthUserReusableCode>
  );
};

export default AddAgency;
