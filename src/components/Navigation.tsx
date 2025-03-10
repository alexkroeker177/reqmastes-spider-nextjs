"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, BarChart2, Layout, House } from 'lucide-react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoginForm } from '@/components/ui/loginform';
import { useAuth } from "@/app/context/auth";

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="flex justify-between h-16">
          {/* Logo and Project Name */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-900 hover:text-gray-600"
            >
              <Image 
                src="/imgs/favicon.ico"
                alt="Reqmasters Spider Logo"
                width={24}
                height={24}
              />
              <span className="text-xl font-semibold tracking-tight">
                Reqmasters Spider
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-10">
            <Link
              href="/"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors
                ${pathname === '/'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              <House size={20} />
              <span>Home</span>
            </Link>
            <Link
              href="/berichte"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors
                ${pathname === '/berichte'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              <BarChart2 size={20} />
              <span>Berichte</span>
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors
                ${pathname === '/dashboard'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Layout size={20} />
              <span>Dashboard</span>
            </Link>
            

            {/* User Menu Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <UserCircle size={24} />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user?.username}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                    <UserCircle size={24} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <LoginForm onLoginSuccess={() => setOpen(false)} />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}