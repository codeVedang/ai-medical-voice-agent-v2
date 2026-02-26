import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const menuOptions = [
    {
        id: 1,
        name: 'Home',
        path: '/'
    },
    {
        id: 2,
        name: 'History',
        path: '/dashboard/history'
    },
    {
        id: 3,
        name: 'Pricing',
        path: '/dashboard/billing'
    },
    {
        id: 4,
        name: 'Contact',
        path: '/contact'
    },

]

function AppHeader() {
    return (
        <div className='sticky top-0 z-50 flex items-center justify-between p-4 px-10 md:px-20 lg:px-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'>
            {/* <Image src={'/logo.svg'} alt='logo' width={180} height={90} /> */}
            <h1 className="text-xl font-extrabold text-blue-700 dark:text-blue-400 md:text-2xl tracking-tight">🩺 AIHealthAssis</h1>
            <div className='hidden md:flex items-center gap-10'>
                {menuOptions.map((option, index) => (
                    <Link key={index} href={option.path}>
                        <h2 className='text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 transition-all'>{option.name}</h2>
                    </Link>
                ))}
            </div>
            <div className='flex items-center gap-4'>
                <UserButton />
            </div>
        </div>
    )
}

export default AppHeader
