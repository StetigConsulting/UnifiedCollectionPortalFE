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
import { checkIfUserHasAccessToPage } from "@/helper";
import { Session } from "next-auth";

export function NavMain({
  items,
  session
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    path?: string;
    items?: {
      title: string;
      icon?: LucideIcon;
      url: string;
    }[];
  }[];
  session: Session
}) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const childItems = item.items || [];
        if (item?.items?.length > 0) {
          if (item?.url !== '#') {
            const hasAccessibleChild = childItems.some(subItem =>
              checkIfUserHasAccessToPage({ backendScope: session.user.userScopes, currentUrl: subItem.url })
            );

            if (!hasAccessibleChild) return null;
          }
        } else {
          const hasAccessToParent = checkIfUserHasAccessToPage({ backendScope: session.user.userScopes, currentUrl: item.path || item.url });
          if (!hasAccessToParent) return null;
        }

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={pathname.includes(item.path)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                {item.url ? (
                  <a href={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(pathname.includes(item.path) && "bg-themeColor py-5 text-white")}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      {childItems.length > 0 && (
                        <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                      )}
                    </SidebarMenuButton>
                  </a>
                ) : (
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={cn(pathname.includes(item.path) && "bg-blue-300")}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {childItems.length > 0 && (
                      <ChevronLeft className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:-rotate-90" />
                    )}
                  </SidebarMenuButton>
                )}
              </CollapsibleTrigger>

              {childItems.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-0 mx-0">
                    {childItems.map((subItem) => {
                      const hasAccess = checkIfUserHasAccessToPage({ backendScope: session.user.userScopes, currentUrl: subItem.url });
                      if (!hasAccess) return null;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            className={cn(pathname === subItem.url && "bg-lightThemeColor")}
                            asChild
                          >
                            <a href={subItem.url}>
                              {subItem.icon && <subItem.icon />}
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu >
  );
}
