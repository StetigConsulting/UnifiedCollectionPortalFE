"use client";
import React, { useEffect, useState } from "react";
import { DualListTransfer, Agent } from "@/components/DualListTransfer";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAgenciesWithDiscom } from "@/app/api-calls/department/api";
import { useSession } from "next-auth/react";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentTransferFormData, agentTransferSchema } from "@/lib/zod";
import { getAllAgentByAgencyId } from '@/app/api-calls/agency/api';

// Types
interface AgencyOption {
  id: number;
  agency_name: string;
}

const AgentTransfer: React.FC = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [fromAgencyId, setFromAgencyId] = useState<number | null>(null);
  const [toAgencyId, setToAgencyId] = useState<number | null>(null);
  const [leftAgents, setLeftAgents] = useState<Agent[]>([]);
  const [rightAgents, setRightAgents] = useState<Agent[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number[]>([]);
  const [selectedRight, setSelectedRight] = useState<number[]>([]);
  const [retainStructure, setRetainStructure] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<AgentTransferFormData>({
    resolver: zodResolver(agentTransferSchema),
    defaultValues: {
      fromAgencyId: undefined,
      toAgencyId: undefined,
      agents: [],
    },
  });

  // Fetch agencies on mount
  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgents = async () => {
    if (fromAgencyId) {
      setIsLoading(true);
      try {
        const response = await getAllAgentByAgencyId(fromAgencyId);
        setLeftAgents(response?.data || []);
        setRightAgents([]);
        setSelectedLeft([]);
        setSelectedRight([]);
      } catch (e) {
        setLeftAgents([]);
        setRightAgents([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setLeftAgents([]);
      setRightAgents([]);
    }
  };

  // Fetch agents when fromAgencyId changes
  useEffect(() => {
    fetchAgents();
  }, [fromAgencyId]);

  // Sync form state with local state
  useEffect(() => {
    setValue("fromAgencyId", fromAgencyId ?? undefined);
    setValue("toAgencyId", toAgencyId ?? undefined);
    setValue(
      "agents",
      rightAgents.map((a) => a.id)
    );
  }, [fromAgencyId, toAgencyId, rightAgents, setValue]);

  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const data = await getAgenciesWithDiscom(session.user.discomId);
      setAgencies(data?.data || []);
    } catch (e) {
      setAgencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Selection handlers
  const handleSelectLeft = (id: number) => {
    setSelectedLeft((selectedLeft) =>
      selectedLeft.includes(id)
        ? selectedLeft.filter((i) => i !== id)
        : [...selectedLeft, id]
    );
  };

  const handleSelectRight = (id: number) => {
    setSelectedRight((selectedRight) =>
      selectedRight.includes(id)
        ? selectedRight.filter((i) => i !== id)
        : [...selectedRight, id]
    );
  };

  // Move agents between lists
  const moveRight = () => {
    const toMove = leftAgents.filter((a) => selectedLeft.includes(a.id));
    setRightAgents((rightAgents) => [...rightAgents, ...toMove]);
    setLeftAgents((leftAgents) =>
      leftAgents.filter((a) => !selectedLeft.includes(a.id))
    );
    setSelectedLeft([]);
  };

  const moveAllRight = () => {
    setRightAgents((rightAgents) => [...rightAgents, ...leftAgents]);
    setLeftAgents([]);
    setSelectedLeft([]);
  };

  const moveLeft = () => {
    const toMove = rightAgents.filter((a) => selectedRight.includes(a.id));
    setLeftAgents((leftAgents) => [...leftAgents, ...toMove]);
    setRightAgents((rightAgents) =>
      rightAgents.filter((a) => !selectedRight.includes(a.id))
    );
    setSelectedRight([]);
  };

  const moveAllLeft = () => {
    setLeftAgents((leftAgents) => [...leftAgents, ...rightAgents]);
    setRightAgents([]);
    setSelectedRight([]);
  };

  // Form submit handler
  const onSubmit = (data: AgentTransferFormData) => {
    alert(
      `Transferring ${data.agents.length} agents from agency ${data.fromAgencyId} to agency ${data.toAgencyId}.`
    );
  };

  // Prepare agency picklist options
  const agencyOptions = agencies.map((a) => ({
    id: a.id,
    value: a.id,
    label: a.agency_name,
  }));

  const formData = watch();

  return (
    <AuthUserReusableCode
      pageTitle="Agent Transfer Wizard"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <CustomizedSelectInputWithLabel
              label="From Agency"
              list={agencyOptions.filter((a) => a.value !== toAgencyId)}
              value={fromAgencyId ?? ""}
              required
              placeholder="Select Agency"
              errors={errors.fromAgencyId}
              {...register("fromAgencyId", {
                onChange: (e) => {
                  const val = Number(e.target.value);
                  setFromAgencyId(val);
                  if (val === toAgencyId) setToAgencyId(undefined);
                },
              })}
            />
          </div>
          <div className="flex-1">
            <CustomizedSelectInputWithLabel
              label="To Agency"
              list={agencyOptions.filter((a) => a.value !== fromAgencyId)}
              value={toAgencyId ?? ""}
              required
              placeholder="Select Agency"
              errors={errors.toAgencyId}
              {...register("toAgencyId", {
                onChange: (e) => {
                  const val = Number(e.target.value);
                  setToAgencyId(val);
                  if (val === fromAgencyId) setFromAgencyId(undefined);
                },
              })}
            />
          </div>
        </div>
        {formData?.fromAgencyId && formData?.toAgencyId && (
          <>
            {" "}
            <DualListTransfer
              leftTitle={
                agencies.find((a) => a.id === fromAgencyId)?.agency_name ||
                "From Agency"
              }
              rightTitle={
                agencies.find((a) => a.id === toAgencyId)?.agency_name ||
                "To Agency"
              }
              leftList={leftAgents}
              rightList={rightAgents}
              selectedLeft={selectedLeft}
              selectedRight={selectedRight}
              onSelectLeft={handleSelectLeft}
              onSelectRight={handleSelectRight}
              moveRight={moveRight}
              moveAllRight={moveAllRight}
              moveLeft={moveLeft}
              moveAllLeft={moveAllLeft}
            />
            {errors.agents && (
              <p className="text-red-500 text-xs mt-2">
                {errors.agents.message}
              </p>
            )}
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                checked={retainStructure}
                onChange={(e) => setRetainStructure(e.target.checked)}
                className="mr-2"
                id="retain-structure"
              />
              <label htmlFor="retain-structure" className="text-sm">
                Retain office structure of the agents after their transfer.
              </label>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit">Submit</Button>
            </div>
          </>
        )}
      </form>
    </AuthUserReusableCode>
  );
};

export default AgentTransfer;
