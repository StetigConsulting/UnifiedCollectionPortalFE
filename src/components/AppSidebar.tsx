import * as React from "react";
import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import User from "./User";
import Image from "next/image";

const data = {
  navMain: [
    {
      title: "Dashboard",
      items: [],
    },
    {
      title: "Agency",
      items: [
        { title: "Add Agency", url: "/department/add-agency" },
        { title: "Recharge", url: '/department/recharge' },
        { title: "Change Collector Type", url: '/department/collector-type' },
        { title: "Edit Agency", url: '/department/edit-agency' },
        { title: "Extend Validity", url: '/department/extend-validity' },
        { title: "View Agency", url: "#" },
        { title: "View Balance", url: "#" },
        { title: "Reset Device (Collector)", url: "#" },
        { title: "Change Collector Role", url: "#" },
        { title: "Change Section", url: "#" },
      ],
    },
    {
      title: "Report",
      items: [],
    },
    {
      title: "News/Notice",
      items: [],
    },
    {
      title: "Logout",
      items: [],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="py-4">
        <Image
          alt=""
          width={150}
          height={1000}
          src="/images/logo.jpg"
          className="mx-auto object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* <User /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
