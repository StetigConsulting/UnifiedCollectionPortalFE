"use client";

import { ChevronLeft, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    path?: string;
    items?: {
      title: string;
      icon?: LucideIcon;
      url: string;
    }[];
  }[];
}) {

  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={pathname.includes(item.path)}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              {item.url ?
                <a href={item.url}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(pathname.includes(item.path) && "bg-themeColor py-5 text-white")}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.items && item.items.length > 0 && (
                      <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                    )}
                  </SidebarMenuButton>
                </a> :
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(pathname.includes(item.path) && "bg-blue-300")}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.items && item.items.length > 0 && (
                    <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                  )}
                </SidebarMenuButton>
              }
            </CollapsibleTrigger>
            {item.items && item.items.length > 0 &&
              <CollapsibleContent>
                <SidebarMenuSub className="border-l-0 mx-0">
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton className={cn(pathname.includes(subItem.url) && "bg-lightThemeColor")} asChild>
                        <a href={subItem.url}>
                          {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            }
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
}
