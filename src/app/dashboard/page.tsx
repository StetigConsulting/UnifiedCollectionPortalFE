'use client'

import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dashboardSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { z } from "zod";

type FormData = z.infer<typeof dashboardSchema>;

const dashboard = () => {

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(dashboardSchema),
  });

  return (
    // <AuthUserReusableCode pageTitle='Dashboard'>
    <form className="flex items-center space-x-4">
      <div className="w-1/4">
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
          From Date
        </label>
        <Input
          {...register('start')}
          type="date"
          id="start-date"
          className="mt-1 block w-full"
        />
      </div>
      <div className="w-1/4">
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
          To Date
        </label>
        <Input
          type="date"
          id="end-date"
          className="mt-1 block w-full"
        />
      </div>
      <Button variant="default" className="px-4 py-2 self-end">
        Search
      </Button>
    </form>
    // </AuthUserReusableCode >
  );
}

export default dashboard;