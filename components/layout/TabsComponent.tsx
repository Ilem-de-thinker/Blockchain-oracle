import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const TABS_DATA = [
   {
      id: "dashboard",
      label: "Dashboard",
      title: "Welcome to your dashboard",
      content: "This is your personal space where you can monitor activity, access important tools, and manage your account. Quickly view your recent projects, notifications, and updates all in one place. Stay productive by navigating through the tabs to explore content, manage your profile, or start something new."
   },
   {
      id: "settings",
      label: "Settings",
      title: "Content Management",
      content: "Here you can manage all your uploaded documents, posts, and drafts. You can create new entries, update existing content, or organize items using tags and folders. Everything is autosaved in real time, so you never lose your work. Need to collaborate? Invite team members and assign editing rights as needed."
   },
   {
      id: "profile",
      label: "Profile",
      title: "Your Profile",
      content: "This section lets you update your personal information, manage your preferences, and customize your experience. Add a profile picture, change your display name, connect third-party accounts, or configure notification settings. Keeping your profile up to date ensures better collaboration and account security."
   },
   {
      id: "insight",
      label: "Insight",
      title: "Insights",
      content: "This section helps you review and update key account details and preferences. Manage your profile information, connected accounts, and notification settings to keep everything aligned with how you use the platform."
   }
];

const TabsComponent: React.FC = () => {
   const [activeTab, setActiveTab] = useState("dashboard");

   return (
      <div className="px-4 md:px-8 mt-6">
         {/* Tab List */}
         <ul
            role="tablist"
            aria-label="Dashboard sections"
            className="inline-flex flex-wrap gap-2 font-medium text-sm text-text-muted"
         >
            {TABS_DATA.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                  <li key={tab.id}>
                     <button
                        role="tab"
                        id={`${tab.id}Tab`}
                        aria-selected={isActive}
                        aria-controls={`${tab.id}Content`}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                           "tab py-2 px-3.5 border-b-2 cursor-pointer transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                           isActive ? "text-primary border-primary" : "border-transparent"
                        )}
                     >
                        {tab.label}
                     </button>
                  </li>
               );
            })}
         </ul>

         {/* Tab Panels */}
         <div className="px-3">
            {TABS_DATA.map((tab) => (
               <div
                  key={tab.id}
                  id={`${tab.id}Content`}
                  role="tabpanel"
                  aria-labelledby={`${tab.id}Tab`}
                  className={cn("tab-content max-w-2xl mt-8", activeTab === tab.id ? "block" : "hidden")}
               >
                  <h4 className="text-base font-semibold text-text">
                     {tab.title}
                  </h4>
                  <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                     {tab.content}
                  </p>
               </div>
            ))}
         </div>
      </div>
   );
};

export default TabsComponent;
