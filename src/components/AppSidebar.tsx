"use client";

import * as React from "react";
import {
  Ban,
  Calendar,
  CreditCard,
  Edit,
  Eye,
  Folder,
  FolderClosed,
  FolderSync,
  Gauge,
  House,
  Import,
  LogOut,
  Merge,
  MonitorCog,
  NotepadText,
  PiggyBank,
  ReceiptText,
  UserCogIcon,
  UserPlus2,
  Volume2Icon,
  Wallet,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { NavMain } from "./nav-main";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { handleSignOut } from "@/app/actions/authActions";
import { getRosourceByDiscomId } from "@/app/api-calls/other/api";
import { getAgencyRechargeableBalance } from "@/app/api-calls/department/api";
import { reportIcon } from "@/lib/utils";
import { toast } from "sonner";

const navData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Home",
      url: "/",
      icon: House,
      path: '/',
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Gauge,
      path: '/dashboard',
    },
    {
      title: "Configuration",
      icon: Folder,
      url: "#",
      path: '/admin/',
      items: [
        {
          title: 'Mode Of Payment',
          url: '/admin/mode-of-payment',
          icon: Gauge,
          path: '/admin/mode-of-payment'
        },
        {
          title: 'Denied To Pay',
          url: '/admin/denied-to-pay',
          icon: Ban,
          path: '/admin/denied-to-pay',
        },
        {
          title: 'Non Energy Type',
          url: '/admin/non-energy-type',
          icon: Merge,
          path: '/admin/non-energy-type',
        },
        {
          title: 'Add Collector Type',
          url: '/admin/add-collector-type',
          icon: Merge,
          path: '/admin/add-collector-type',
        },
        {
          title: 'Office Structure',
          url: '/admin/office-structure',
          icon: FolderClosed,
          path: '/admin/office-stucture'
        },
        {
          title: 'Receipt For Postpaid',
          url: '/admin/receipt-for-postpaid',
          icon: ReceiptText,
          path: '/admin/receipt-for-postpaid',
        },
        {
          title: "Pseudo Level Mapping",
          icon: UserPlus2,
          url: "/agency/binder-mapping",
        },
        {
          title: 'Color Coding',
          url: '/admin/color-coding',
          icon: Gauge,
          path: '/admin/color-coding',
        },
        {
          title: 'Incentive',
          url: '/admin/incentive',
          icon: PiggyBank,
          path: '/admin/incentive',
        },
        {
          title: 'Cancel Transaction',
          url: '/admin/cancel-transaction',
          icon: PiggyBank,
          path: '/admin/cancel-transaction',
        },
        {
          title: 'Update POS',
          url: '/admin/update-pos',
          icon: PiggyBank,
          path: '/admin/update-pos',
        },
        {
          title: 'Agent Transfer',
          url: '/admin/agent-transfer',
          icon: PiggyBank,
          path: '/admin/agent-transfer',
        }
      ]
    },
    {
      title: "Agency Management",
      icon: Folder,
      url: "#",
      path: '/department/',
      items: [
        {
          title: "Add Agency",
          icon: UserPlus2,
          url: "/department/add-agency",
        },
        {
          title: "Recharge",
          icon: CreditCard,
          url: "/department/recharge",
        },
        { title: "Edit Agency", icon: Edit, url: "/department/edit-agency" },
        { title: "Edit Agency Area", icon: Edit, url: "/department/edit-agency-area" },
        { title: "Extend Validity", icon: Calendar, url: "/department/extend-validity" },
        { title: "View Agency", icon: Eye, url: '/department/view-agency' },
        {
          title: "Agency Bank Deposit",
          icon: CreditCard,
          url: "/department/bank-deposit",
        },
        {
          title: "Change Collector Type",
          icon: UserCogIcon,
          url: "/department/collector-type",
        },
        { title: "View Balance", icon: Wallet, url: '/department/view-balance' },
        {
          title: 'Department User',
          url: '/admin/department-user',
          icon: UserPlus2,
          path: '/admin/department-user'
        },
        {
          title: 'Import',
          url: '/admin/import',
          icon: Import,
          path: '/admin/import',
        },
        {
          title: 'Create New User',
          url: '/admin/create-new-user',
          icon: ReceiptText,
          path: '/admin/create-new-user',
        },
        {
          title: 'Agency Security Deposit',
          url: '/department/agency-security-deposit',
          icon: PiggyBank,
          path: '/department/agency-security-deposit',
        }
      ]
    },
    {
      title: "Agent Management",
      icon: Folder,
      url: "#",
      path: '/agency/',
      items: [
        {
          title: "Add Agent",
          icon: UserPlus2,
          url: "/agency/add-collector",
        },
        {
          title: "Edit Agent",
          icon: UserPlus2,
          url: "/agency/edit-collector",
        },
        {
          title: "View Agent",
          icon: Eye,
          url: "/agency/view-collector",
        },
        {
          title: "Recharge Agent",
          icon: UserPlus2,
          url: "/agency/recharge",
        },
        {
          title: "Reverse Balance",
          icon: UserPlus2,
          url: "/agency/reverse-agent-balance",
        },
        {
          title: "Extend Validity",
          icon: UserPlus2,
          url: "/agency/extend-validity",
        },
        {
          title: "Reset Collector",
          icon: UserPlus2,
          url: "/agency/reset-collector",
        },
        {
          title: "Bank Deposit",
          icon: UserPlus2,
          url: "/agency/bank-deposit",
        },
        {
          title: "Agent Deposit Acknowledgement",
          icon: UserPlus2,
          url: "/agency/agent-deposit-acknowledgement",
        },
        {
          title: "Create Supervisor",
          icon: UserPlus2,
          url: "/agency/add-new-supervisor",
        },
        { title: "Edit Agent Area & Role", icon: Edit, url: "/department/edit-agent-area" },
        { title: "Edit Agent Area", icon: Edit, url: "/agency/edit-agent-area" },
        { title: "Reset Device", icon: MonitorCog, url: '/department/reset-device' },
        {
          title: 'Supervisor Bank Deposit',
          url: '/agency/supervisor-deposit',
          icon: ReceiptText,
          path: '/agency/supervisor-deposit',
        },
      ]
    },
    // {
    //   title: "Agency",
    //   icon: Folder,
    //   url: "#",
    //   path: '/agency/',
    //   items: [

    //   ]
    // },
    // {
    //   title: "Super Admin",
    //   icon: Folder,
    //   url: "#",
    //   path: '/admin/',
    //   items: [

    //   ],
    // },
    {
      title: "Report",
      icon: NotepadText,
      url: "#",
      path: '/report/',
      items: [
        {
          title: "Agent Deposit Acknowledgement",
          icon: reportIcon,
          url: "/report/agent-deposit-acknowledgement",
        },
        {
          title: "Daily Collection",
          icon: reportIcon,
          url: "/report/daily-collection",
        },
        {
          title: "Agent Wallet History",
          icon: reportIcon,
          url: "/report/agent-wallet-history",
        },
        {
          title: "Agency Wallet History",
          icon: reportIcon,
          url: "/report/agency-wallet-history",
        },
        {
          title: "Billing Report",
          icon: reportIcon,
          url: "/report/billing-report",
        },
        {
          title: "Top Up History",
          icon: reportIcon,
          url: "/report/top-up-history",
        },
        {
          title: "Collector Top Up History",
          icon: reportIcon,
          url: "/report/collector-top-up-history",
        },
        {
          title: "Login History",
          icon: reportIcon,
          url: "/report/login-history",
        },
        {
          title: "Daily Energy Collection",
          icon: reportIcon,
          url: "/report/daily-energy-collection",
        },
        {
          title: "Daily Non Energy Collection",
          icon: reportIcon,
          url: "/report/daily-non-energy-collection",
        },
        {
          title: "Agent Wise Collection",
          icon: reportIcon,
          url: "/report/agency-wise-collection",
        },
        {
          title: "Collector Wise",
          icon: reportIcon,
          url: "/report/collector-wise",
        },
        {
          title: "Cancel Wise Receipt",
          icon: reportIcon,
          url: "/report/cancel-wise-receipt",
        },
        {
          title: "Denied Energy Consumer",
          icon: reportIcon,
          url: "/report/denied-energy-consumer",
        },
        {
          title: "Denied Non Energy Consumer Report",
          icon: reportIcon,
          url: "/report/denied-non-energy-consumer",
        },
        {
          title: "Counter Collector",
          icon: reportIcon,
          url: "/report/counter-collector",
        },
        {
          title: "Collector Activity",
          icon: reportIcon,
          url: "/report/collector-activity",
        },
        {
          title: "Wallet History",
          icon: reportIcon,
          url: "/report/wallet-history",
        },
        {
          title: "CC Wallet History",
          icon: reportIcon,
          url: "/report/cc-wallet-history",
        },
        {
          title: 'Agent Bank Deposit',
          icon: reportIcon,
          url: "/report/agent-bank-deposit",
        },
        {
          title: 'MMI',
          icon: reportIcon,
          url: "/report/mmi",
        },
        {
          title: 'Energy Collection Summary',
          icon: reportIcon,
          url: "/report/energy-collection-summary",
        },
        {
          title: 'Non Energy Collection Summary',
          icon: reportIcon,
          url: "/report/non-energy-collection-summary",
        },
        {
          title: 'Agent Wise Summary',
          url: '/report/agent-wise-summary',
          icon: reportIcon,
          path: '/report/agent-wise-summary',
        },
        {
          title: 'Agent Attendance',
          url: '/report/agent-attendance',
          icon: reportIcon,
          path: '/report/agent-attendance',
        },
        {
          title: 'Cancelled Transaction',
          url: '/report/cancelled-transaction',
          icon: reportIcon,
          path: '/report/cancelled-transaction',
        },
        {
          title: 'Agent Details',
          url: '/report/agent-details',
          icon: reportIcon,
          path: '/report/agent-details',
        },
        {
          title: 'Agent Login',
          url: '/report/agent-login',
          icon: reportIcon,
          path: '/report/agent-login',
        },
        {
          title: 'Total Collection',
          url: '/report/total-collection',
          icon: reportIcon,
          path: '/report/total-collection',
        },
        {
          title: 'Collection Posting',
          url: '/report/collection-posting',
          icon: reportIcon,
          path: '/report/collection-posting',
        },
        {
          title: 'Reconciliation',
          url: '/report/reconciliation',
          icon: reportIcon,
          path: '/report/reconciliation',
        },
        {
          title: 'Supervisor Bank Deposit',
          url: '/report/supervisor-bank-deposit',
          icon: reportIcon,
          path: '/report/supervisor-bank-deposit',
        },
        {
          title: 'Transaction Details',
          url: '/report/transaction-details',
          icon: reportIcon,
          path: '/report/transaction-details',
        },
        {
          title: 'Agency Mid Night Balance',
          url: '/report/agency-mid-night-balance',
          icon: reportIcon,
          path: '/report/agency-mid-night-balance',
        },
        {
          title: 'Digital Collection',
          url: '/report/digital-payment-collection',
          icon: reportIcon,
          path: '/report/digital-payment-collection',
        },
      ]
    },
    // {
    //   title: "News/Notice",
    //   icon: Volume2Icon,
    //   url: "/new-notices",
    //   path: "/new-notices",
    // },
    {
      title: "News/Notice",
      icon: Volume2Icon,
      url: "/add-news",
      path: "/add-news",
    },
    // {
    //   title: "Logout",
    //   icon: LogOut,
    //   url: "#",
    //   path: '#',
    // },
  ],
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export function AppSidebar({ logoLink, onSignOut }) {

  const { data: session } = useSession()

  const filteredNavMain = navData.navMain

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      toast.error("You have been logged out due to inactivity.");
      handleSignOut();
    }, INACTIVITY_TIMEOUT);
  };

  React.useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Sidebar>
      <SidebarHeader className="bg-lightThemeColor min-h-[135px]">
        {logoLink &&
          <Image
            alt=""
            width={150}
            height={1000}
            priority
            unoptimized
            src={logoLink}
            className="m-auto object-contain align-center"
          />}
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NavMain items={filteredNavMain} session={session} />
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={onSignOut}><LogOut /> Log Out</Button>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
