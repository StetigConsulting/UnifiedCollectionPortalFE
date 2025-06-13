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
          title: 'Denied to pay',
          url: '/admin/denied-to-pay',
          icon: Ban,
          path: '/admin/denied-to-pay',
        },
        {
          title: 'Non energy type',
          url: '/admin/non-energy-type',
          icon: Merge,
          path: '/admin/non-energy-type',
        },
        {
          title: 'Add Collector type',
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
          title: 'Portal User Management',
          url: '/admin/create-new-user',
          icon: ReceiptText,
          path: '/admin/create-new-user',
        },
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
          title: "Top up history",
          icon: reportIcon,
          url: "/report/top-up-history",
        },
        {
          title: "Collector Top up history",
          icon: reportIcon,
          url: "/report/collector-top-up-history",
        },
        {
          title: "Transaction record",
          icon: reportIcon,
          url: "/report/transaction-record",
        },
        {
          title: "Login history",
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
          title: "Agent wise Collection",
          icon: reportIcon,
          url: "/report/agency-wise-collection",
        },
        {
          title: "Collector wise",
          icon: reportIcon,
          url: "/report/collector-wise",
        },
        {
          title: "Cancel wise receipt",
          icon: reportIcon,
          url: "/report/cancel-wise-receipt",
        },
        {
          title: "Denied Energy consumer",
          icon: reportIcon,
          url: "/report/denied-energy-consumer",
        },
        {
          title: "Denied Non Energy consumer report",
          icon: reportIcon,
          url: "/report/denied-non-energy-consumer",
        },
        {
          title: "Counter collector",
          icon: reportIcon,
          url: "/report/counter-collector",
        },
        {
          title: "Collector activity",
          icon: reportIcon,
          url: "/report/collector-activity",
        },
        {
          title: "Wallet history",
          icon: reportIcon,
          url: "/report/wallet-history",
        },
        {
          title: "CC wallet history",
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
