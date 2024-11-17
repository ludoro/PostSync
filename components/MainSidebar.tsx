'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { FileText, Settings, User } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface MainSidebarProps {
  currentPath?: string;
}

interface UserData {
  first_name: string;
  // Add other user data fields as needed
}

export function MainSidebar({ currentPath = '' }: MainSidebarProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-orange-500">
          {loading ? (
            'Loading...'
          ) : userData?.first_name ? (
            `Hey, ${userData.first_name}!`
          ) : (
            'Dashboard'
          )}
        </h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton>
                <FileText className="mr-2 h-4 w-4" />
                Content
              </SidebarMenuButton>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/dashboard')}
                    className={currentPath === '/dashboard' ? 'bg-orange-100' : ''}
                  >
                    Write a new post
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/scheduled-posts')}
                    className={currentPath === '/scheduled-posts' ? 'bg-orange-100' : ''}
                  >
                    Scheduled posts
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Account settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton>
                <Settings className="mr-2 h-4 w-4" />
                Account settings
              </SidebarMenuButton>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/manage-plan')}
                    className={currentPath === '/manage-plan' ? 'bg-orange-100' : ''}
                  >
                    Manage your plan
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleNavigation('/social-integrations')}
                    className={currentPath === '/social-integrations' ? 'bg-orange-100' : ''}
                  >
                    Social integrations
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}