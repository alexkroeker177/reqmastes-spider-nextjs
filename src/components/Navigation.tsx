"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserCircle, BarChart2, Layout, House } from 'lucide-react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoginForm } from '@/components/ui/loginform';

export default function Navigation() {
  const pathname = usePathname();

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
                ${pathname === '/dashboard'
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
            

            {/* Login Icon */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                  <UserCircle size={24} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <LoginForm />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </nav>
  );
}