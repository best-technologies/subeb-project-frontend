'use client';
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', disabled: false },
    { id: 'students', label: 'Students', icon: '👥', disabled: false },
    { id: 'schools', label: 'Schools', icon: '🏫', disabled: false },
    { id: 'reports', label: 'Reports', icon: '📈', disabled: true },
    { id: 'analytics', label: 'Analytics', icon: '📋', disabled: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', disabled: true }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white/10 backdrop-blur-lg border-r border-white/20 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto lg:relative
        w-64 flex-shrink-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-white font-bold text-lg">ASUBEB</span>
              </div>
              <button
                onClick={onToggle}
                className="lg:hidden text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => !item.disabled && onTabChange(item.id)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200
                      ${item.disabled 
                        ? 'text-gray-500 cursor-not-allowed opacity-50' 
                        : activeTab === item.id 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.disabled && (
                      <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm">School Management</p>
              <p className="text-gray-500 text-xs">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 