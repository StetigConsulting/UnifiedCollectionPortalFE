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
import { cn, urlsListWithTitle } from "@/lib/utils";
import { checkIfUserHasAccessToPage, checkIfUserHasActionAccess, hideMenuAccordionItem } from "@/helper";
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
        const isDefaultOpen = item.items?.length > 0
          ? childItems.some(child => child.url === pathname)
          : item.url === pathname;
        if (childItems?.length > 0) {
          if (hideMenuAccordionItem(item?.title, childItems, session?.user?.userScopes)) return null;
        } else {
          console.log("item.url", item.url, pathname);
          if (pathname === urlsListWithTitle.dashboard.url && item.url === urlsListWithTitle.dashboard.url) {
            ['dashboardBillUploadHistory', 'dashboardTransactionSummary', 'dashboardPerformanceSummary'].forEach((action) => {
              const hasAccess = checkIfUserHasActionAccess({
                backendScope: session?.user?.userScopes,
                currentAction: action,
              });
              if (!hasAccess) return null;
            })

          } else {
            const hasAccessToParent = checkIfUserHasAccessToPage({ backendScope: session?.user?.userScopes, currentUrl: item.path || item.url });
            if (!hasAccessToParent) return null;
          }
        }

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isDefaultOpen}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                {item.url != '#' ? (
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
                    {childItems.map((subItem, index) => {
                      const hasAccess = checkIfUserHasAccessToPage({ backendScope: session?.user?.userScopes, currentUrl: subItem.url });
                      if (!hasAccess) return null;

                      return (
                        <SidebarMenuSubItem key={subItem.title + index}>
                          <SidebarMenuSubButton
                            className={cn(pathname === subItem.url && "bg-lightThemeColor")}
                            asChild
                          >
                            <a className='min-h-7 h-auto' href={subItem.url}>
                              {subItem.icon && <subItem.icon />}
                              <p>{subItem.title}</p>
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
