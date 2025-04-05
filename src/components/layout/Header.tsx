'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Couple Memories Map
              </Link>
            </div>
            <nav className="ml-6 flex space-x-4 items-center overflow-x-auto pb-1">
              <Link 
                href="/map" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/map' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                マップ
              </Link>
              <Link 
                href="/memories" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/memories' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                思い出一覧
              </Link>
              <Link 
                href="/wishlist" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/wishlist' 
                    ? 'bg-pink-100 text-pink-800' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                行きたい場所
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}