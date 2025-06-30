import React, { useState } from "react";
import { Home, Users, FileText, Settings, User, LogOut, X } from "lucide-react";
import { Button } from "@/components/common/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
} from "@/components/common/ui/sidebar";

const SidebarToggle = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Sidebar
      className={`border-r bg-white transition-all duration-300 ${
        isOpen ? "w-[280px]" : "w-16"
      }`}
    >
      <div className="flex justify-between items-center border-b p-4">
        <h1
          className={`text-2xl font-bold text-blue-800 ${
            isOpen ? "" : "hidden"
          }`}
        >
          SDET Dashboard
        </h1>
        <Button
          variant="ghost"
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          className="p-2"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <div className="h-5 w-5 bg-blue-800 rounded-full"></div>
          )}
        </Button>
      </div>

      <SidebarContent className={`flex-1 ${isOpen ? "" : "hidden"}`}>
        <SidebarGroup>
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            {isOpen && "Dashboard"}
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            {isOpen && "Candidates"}
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            {isOpen && "Assessments"}
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            {isOpen && "Settings"}
          </Button>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
          <User className="mr-2 h-4 w-4" />
          {isOpen && "User Profile"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarToggle;
