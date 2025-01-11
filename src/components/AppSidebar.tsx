"use client";

import * as React from "react";
import {
  Calendar,
  CreditCard,
  Edit,
  Eye,
  Folder,
  FolderSync,
  Gauge,
  LogOut,
  MonitorCog,
  NotepadText,
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
      title: "Agency",
      icon: Folder,
      url: "#",
      path: '/department',
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
        { title: "Extend Validity", icon: Calendar, url: "/department/extend-validity" },
        { title: "View Agency", icon: Eye, url: "#" },
        { title: "View Balance", icon: Wallet, url: "#" },
        { title: "Reset Device (Collector)", icon: MonitorCog, url: "#" },
        { title: "Change Collector Role", icon: FolderSync, url: "#" },
        { title: "Change Section", icon: FolderSync, url: "#" },
      ],
    },
    {
      title: "Report",
      icon: NotepadText,
      url: "#",
      path: "#",
    },
    {
      title: "News/Notice",
      icon: Volume2Icon,
      url: "#",
      path: "#",
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
      <SidebarHeader>
        <Image
          alt=""
          width={150}
          height={1000}
          src="/images/logo.jpg"
          className="mx-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
