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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Gauge,
      path: '/dashboard'
    },
    {
      title: "Department",
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
        {
          title: "Change Collector Type",
          icon: UserCogIcon,
          url: "/department/collector-type",
        },
        { title: "Edit Agency", icon: Edit, url: "/department/edit-agency" },
        { title: "Edit Agency Area", icon: Edit, url: "/department/edit-agency-area" },
        { title: "Edit Agent Area & Role", icon: Edit, url: "/department/edit-agent-area" },
        { title: "Extend Validity", icon: Calendar, url: "/department/extend-validity" },
        { title: "View Agency", icon: Eye, url: '/department/view-agency' },
        { title: "View Balance", icon: Wallet, url: '/department/view-balance' },
        { title: "Reset Device (Collector)", icon: MonitorCog, url: '/department/reset-device' },
        { title: "Change Collector Role", icon: FolderSync, url: '/department/change-collector-role' },
        { title: "Change Section", icon: FolderSync, url: '/department/change-section' },
      ],
    },
    {
      title: "Agency",
      icon: Folder,
      url: "#",
      path: '/agency/',
      items: [
        {
          title: "Add Collector",
          icon: UserPlus2,
          url: "/agency/add-collector",
        },
        {
          title: "View Collector",
          icon: Eye,
          url: "/agency/view-collector",
        },
        {
          title: "Binder Mapping",
          icon: UserPlus2,
          url: "/agency/binder-mapping",
        },
        {
          title: "Recharge Agent",
          icon: UserPlus2,
          url: "/agency/recharge",
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
      ]
    },
    {
      title: "Admin",
      icon: Folder,
      url: "#",
      path: '/admin/',
      items: [
        {
          title: 'Department User',
          url: '/admin/department-user',
          icon: UserPlus2,
          path: '/admin/department-user'
        },
        {
          title: 'Office Structure',
          url: '/admin/office-structure',
          icon: FolderClosed,
          path: '/admin/office-stucture'
        },
        {
          title: 'Payment configuration',
          url: '/admin/payment-configuration',
          icon: Gauge,
          path: '/admin/payment-configuration'
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
          title: 'Import',
          url: '/admin/import',
          icon: Import,
          path: '/admin/import',
        },
        {
          title: 'Receipt for Postpaid',
          url: '/admin/receipt-for-postpaid',
          icon: ReceiptText,
          path: '/admin/receipt-for-postpaid',
        },
      ],
    },
    {
      title: "Report",
      icon: NotepadText,
      url: "#",
      path: '/agency/report/',
      items: [
        {
          title: "Top up history",
          icon: UserPlus2,
          url: "/agency/report/top-up-history",
        },
        {
          title: "Collector Top up history",
          icon: UserPlus2,
          url: "/agency/report/collector-top-up-history",
        },
        {
          title: "Transaction record",
          icon: UserPlus2,
          url: "/agency/report/transaction-record",
        },
        {
          title: "Login history",
          icon: UserPlus2,
          url: "/agency/report/login-history",
        },
        {
          title: "Daily Agent Collection",
          icon: UserPlus2,
          url: "/agency/report/daily-agent-collection",
        },
        {
          title: "Agent wise Collection",
          icon: UserPlus2,
          url: "/agency/report/agency-wise-collection",
        },
        {
          title: "Collector wise",
          icon: UserPlus2,
          url: "/agency/report/collector-wise",
        },
        {
          title: "Cancel wise receipt",
          icon: UserPlus2,
          url: "/agency/report/cancel-wise-receipt",
        },
        {
          title: "Denied consumer report",
          icon: UserPlus2,
          url: "/agency/report/denied-consumer",
        },
        {
          title: "Counter collector",
          icon: UserPlus2,
          url: "/agency/report/counter-collector",
        },
        {
          title: "Collector activity",
          icon: UserPlus2,
          url: "/agency/report/collector-activity",
        },
        {
          title: "Wallet history",
          icon: UserPlus2,
          url: "/agency/report/wallet-history",
        },
        {
          title: "CC wallet history",
          icon: UserPlus2,
          url: "/agency/report/cc-wallet-history",
        }
      ]
    },
    {
      title: "News/Notice",
      icon: Volume2Icon,
      url: "/department/add-news",
      path: "/department/add-news",
    },
    {
      title: "Logout",
      icon: LogOut,
      url: "#",
      path: '#',
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="bg-lightThemeColor">
        <Image
          alt=""
          width={150}
          height={1000}
          priority
          unoptimized
          src="/images/logo.png"
          className="mx-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
