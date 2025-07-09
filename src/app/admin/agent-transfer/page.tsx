"use client";
import React, { useEffect, useState, useCallback } from "react";
import { DualListTransfer, Agent } from "@/components/DualListTransfer";
import { Button } from "@/components/ui/button";
import AuthUserReusableCode from "@/components/AuthUserReusableCode";
import { getAgenciesWithDiscom } from "@/app/api-calls/department/api";
import { useSession } from "next-auth/react";
import CustomizedSelectInputWithLabel from "@/components/CustomizedSelectInputWithLabel";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AgentTransferFormData, agentTransferSchema } from "@/lib/zod";
import { getAllAgentByAgencyId } from "@/app/api-calls/agency/api";
import { toast } from "sonner";
import AlertPopupWithState from "@/components/Agency/ViewAgency/AlertPopupWithState";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { agentTransferAPI } from "@/app/api-calls/admin/api";
import SuccessErrorModal from "@/components/SuccessErrorModal";

interface AgencyOption {
  id: number;
  agency_name: string;
}

const AgentTransfer: React.FC = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [leftAgents, setLeftAgents] = useState<Agent[]>([]);
  const [rightAgents, setRightAgents] = useState<Agent[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number[]>([]);
  const [selectedRight, setSelectedRight] = useState<number[]>([]);
  const [retainStructure, setRetainStructure] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AgentTransferFormData>({
    resolver: zodResolver(agentTransferSchema),
    defaultValues: {
      fromAgencyId: undefined,
      toAgencyId: undefined,
      agents: [],
    },
  });

  const formData = watch();

  const fromAgencyId = watch("fromAgencyId");
  const toAgencyId = watch("toAgencyId");

  const fetchAgencies = async () => {
    setIsLoading(true);
    try {
      const data = await getAgenciesWithDiscom(session?.user?.discomId);
      setAgencies(data?.data.filter(item => item.is_active === true) || []);
    } catch (e) {
      setAgencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgents = async () => {
    if (fromAgencyId) {
      setIsLoading(true);
      try {
        const response = await getAllAgentByAgencyId(fromAgencyId);
        setLeftAgents(response?.data.filter(item => item.is_active === true) || []);
        setRightAgents([]);
        setSelectedLeft([]);
        setSelectedRight([]);
        setValue("agents", []);
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

  useEffect(() => {
    fetchAgents();
  }, [fromAgencyId]);

  useEffect(() => {
    setValue(
      "agents",
      rightAgents.map((a) => a.id)
    );
  }, [rightAgents, setValue]);

  const agencyOptions = agencies.map((a) => ({
    id: a.id,
    value: a.id,
    label: a.agency_name,
  }));

  // Selection handlers
  const handleSelectLeft = useCallback((id: number) => {
    setSelectedLeft((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectRight = useCallback((id: number) => {
    setSelectedRight((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Move agents between lists
  const moveRight = useCallback(() => {
    const toMove = leftAgents.filter((a) => selectedLeft.includes(a.id));
    setRightAgents((prev) => [...prev, ...toMove]);
    setLeftAgents((prev) => prev.filter((a) => !selectedLeft.includes(a.id)));
    setSelectedLeft([]);
  }, [leftAgents, selectedLeft]);

  const moveAllRight = useCallback(() => {
    setRightAgents((prev) => [...prev, ...leftAgents]);
    setLeftAgents([]);
    setSelectedLeft([]);
  }, [leftAgents]);

  const moveLeft = useCallback(() => {
    const toMove = rightAgents.filter((a) => selectedRight.includes(a.id));
    setLeftAgents((prev) => [...prev, ...toMove]);
    setRightAgents((prev) => prev.filter((a) => !selectedRight.includes(a.id)));
    setSelectedRight([]);
  }, [rightAgents, selectedRight]);

  const moveAllLeft = useCallback(() => {
    setLeftAgents((prev) => [...prev, ...rightAgents]);
    setRightAgents([]);
    setSelectedRight([]);
  }, [rightAgents]);

  const onSubmit = async (data: AgentTransferFormData) => {
    setIsLoading(true);
    try {

      let payload = {
        source_agency_id: fromAgencyId,
        destination_agency_id: toAgencyId,
        agent_ids: formData?.agents,
        is_office_structure_to_be_copied: retainStructure,
      };

      const response = await agentTransferAPI(payload);
      setMessage(`Successfully transferred ${rightAgents.length} agents from ${agencies.find(a => a.id === fromAgencyId)?.agency_name || "-"} to ${agencies.find(a => a.id === toAgencyId)?.agency_name || "-"}`);
      setMessageType("success");
      setIsModalOpen(true);
      reset();
    } catch (e: any) {
      setMessage("Error: " + getErrorMessage(e));
      setMessageType("error");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const [stateForConfirmationPopup, setStateForConfirmationPopup] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  return (
    <AuthUserReusableCode
      pageTitle="Agent Transfer Wizard"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <CustomizedSelectInputWithLabel
              label="From Agency"
              list={agencyOptions.filter((a) => a.value !== toAgencyId)}
              required
              placeholder="Select Agency"
              errors={errors.fromAgencyId}
              {...register("fromAgencyId", { valueAsNumber: true })}
            />
          </div>
          <div className="flex-1">
            <CustomizedSelectInputWithLabel
              label="To Agency"
              list={agencyOptions.filter((a) => a.value !== fromAgencyId)}
              required
              placeholder="Select Agency"
              errors={errors.toAgencyId}
              {...register("toAgencyId", { valueAsNumber: true })}
            />
          </div>
        </div>
        {!isNaN(fromAgencyId) && !isNaN(toAgencyId) && (
          <>
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
            <div className="grid grid-col-6">
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
                <AlertPopupWithState
                  triggerCode={
                    <Button
                      variant="default"
                      disabled={isSubmitting}
                      onClick={handleSubmit((e) => {
                        setStateForConfirmationPopup(true);
                      })}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  }
                  handleContinue={handleSubmit(onSubmit)}
                  title="Confirm Agent Transfer"
                  description={`Are you sure you want to transfer ${rightAgents.length} agents from ${agencies.find(a => a.id === fromAgencyId)?.agency_name || "-"} to ${agencies.find(a => a.id === toAgencyId)?.agency_name || "-"}? This action is irreversible.`}
                  continueButtonText="Yes"
                  isOpen={stateForConfirmationPopup}
                  setIsOpen={setStateForConfirmationPopup}
                />
              </div>
            </div>
          </>
        )}
      </form>

      <SuccessErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={message}
        type={messageType}
      />
    </AuthUserReusableCode>
  );
};

export default AgentTransfer;
