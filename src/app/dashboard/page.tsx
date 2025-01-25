"use client";

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import CustomizedInputWithLabel from "@/components/CustomizedInputWithLabel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type FormData = z.infer<typeof dashboardSchema>;

const dashboard = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(dashboardSchema),
  });

  const onSubmit = (data: FormData) => {
    console.log("i m called");
  };

  return (
    <AuthUserReusableCode pageTitle="Dashboard">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center space-x-4"
      >
        <CustomizedInputWithLabel
          containerClass={"w-1/4"}
          {...register("fromDate")}
          errors={errors.fromDate}
          label="From Date"
          type="date"
        />
        <CustomizedInputWithLabel
          containerClass={"w-1/4"}
          {...register("toDate")}
          errors={errors.toDate}
          label="To Date"
          type="date"
        />
        <Button variant="default" className="self-center">
          Search
        </Button>
      </form>
    </AuthUserReusableCode>
  );
};

export default dashboard;
