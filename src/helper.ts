export const listOfUrlForScopes = [
  {
    url: "/dashboard",
    backendScopeName: "test:agency",
    moduleName: "",
    action: "",
  },
  { url: "/department/add-agency", moduleName: "agency", action: "CREATE" },
  {
    url: "/department/recharge",
    moduleName: "agency",
    action: "RECHARGE_AGENCY_WALLET",
  },
  {
    url: "/department/collector-type",
    moduleName: "agent",
    action: "EDIT_COLLECTOR_ROLE",
  },
  { url: "/department/edit-agency", moduleName: "agency", action: "EDIT" },
  {
    url: "/department/edit-agency-area",
    moduleName: "agency",
    action: "CHANGE_AREA",
  },
  {
    url: "/department/edit-agent-area",
    moduleName: "agent",
    action: "CHANGE_AREA",
  },
  {
    url: "/department/extend-validity",
    moduleName: "agency",
    action: "EXTEND_AGENCY_VALIDITY",
  },
  { url: "/department/view-agency", moduleName: "agency", action: "READ" },
  { url: "/department/view-balance", moduleName: "agency", action: "READ" },
  {
    url: "/department/reset-device",
    moduleName: "agency",
    action: "RESET_COLLECTOR_DEVICE",
  },
  { url: "/department/add-news", moduleName: "", action: "" },
  { url: "/admin/department-user", moduleName: "", action: "" },
  {
    url: "/admin/office-structure",
    moduleName: "office_structure",
    action: "CREATE",
  },
  { url: "/admin/mode-of-payment", moduleName: "", action: "" },
  { url: "/admin/denied-to-pay", moduleName: "", action: "" },
  { url: "/admin/non-energy-type", moduleName: "", action: "" },
  {
    url: "/admin/add-collector-type",
    moduleName: "agent",
    action: "EDIT_COLLECTOR_ROLE",
  },
  { url: "/admin/color-coding", moduleName: "", action: "" },
  { url: "/admin/incentive", moduleName: "", action: "" },
  { url: "/admin/import", moduleName: "", action: "" },
  { url: "/admin/receipt-for-postpaid", moduleName: "", action: "" },
];

const checkIfuserHasAcces = ({ backendScope, currentUrl }) => {
  const allScopes = backendScope?.map((ite) => ite.scope_name);
  const avialableScopes = listOfUrlForScopes.filter((ite) =>
    allScopes.includes(ite.backendScopeName)
  );

  return avialableScopes.filter((ite) => ite.url == currentUrl);
};


checkIfuserHasAcces({
    backendScope : "api response",
    currentUrl : urls.dashbaord
})