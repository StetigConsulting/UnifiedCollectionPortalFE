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
        className="grid grid-cols-2 gap-4"
      >
        <CustomizedInputWithLabel
          {...register("fromDate")}
          errors={errors.fromDate}
          label="From Date"
          type="date"
        />
        <CustomizedInputWithLabel
          {...register("toDate")}
          errors={errors.toDate}
          label="To Date"
          type="date"
        />
        <div className="text-end col-span-2">
          <Button variant="default" className="self-center">
            Search
          </Button>
        </div>
      </form>
    </AuthUserReusableCode>
  );
};

export default dashboard;
