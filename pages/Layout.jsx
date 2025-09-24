

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/api/entities';
import { 
    LayoutDashboard, 
    FileText, 
    PlusCircle, 
    Users, 
    UserCheck,
    ClipboardList,
    CheckSquare,
    FileCheck,
    ShieldAlert,
    Menu,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
    { title: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { title: 'Create BER', href: 'CreateBER', icon: PlusCircle },
    { title: 'Review Queue', href: 'ReviewQueue', icon: FileCheck },
    { title: 'Students', href: 'Students', icon: Users },
    { title: 'Staff', href: 'Staff', icon: UserCheck },
    { title: 'Sites', href: 'Sites', icon: ShieldAlert },
    { title: 'Reports', href: 'Reports', icon: FileText },
    { title: 'Tasks', href: 'Tasks', icon: CheckSquare },
    { title: 'BER Analytics', href: 'BerReport', icon: ClipboardList },
];

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                // Not logged in
            }
        };
        fetchUser();
    }, []);

    const currentPageObject = navItems.find(item => item.href === currentPageName);
    const pageTitle = currentPageObject ? currentPageObject.title : currentPageName;

    return (
        <div className="min-h-screen w-full bg-slate-50">
            <style>{`
                @media print {
                    .sidebar, .header {
                        display: none !important;
                    }
                    main {
                        padding-left: 0 !important;
                        margin-left: 0 !important;
                        width: 100% !important;
                        flex-grow: 1 !important;
                    }
                    .main-content {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    body {
                        background-color: white !important;
                    }
                }
            `}</style>
            <div className={`sidebar fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex h-full flex-col">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-6 h-16">
                        <ShieldAlert className="h-7 w-7 text-blue-600" />
                        <span className="text-xl font-bold text-slate-800">BER Guardian</span>
                    </div>
                    <nav className="flex-1 space-y-1 p-4">
                        {navItems.map((item) => {
                            const isActive = createPageUrl(item.href).split('?')[0] === location.pathname;
                            return (
                                <Link
                                    key={item.title}
                                    to={createPageUrl(item.href)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                        isActive 
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="font-medium">{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto border-t border-slate-200 p-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                    {user.full_name?.[0]}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-semibold text-slate-800">{user.full_name}</p>
                                    <p className="truncate text-sm text-slate-500">{user.app_role || user.role}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => User.logout()}>
                                    <LogOut className="h-5 w-5 text-slate-500" />
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => User.login()}>Sign In</Button>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex flex-col md:pl-64">
                <header className="header sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm md:justify-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-semibold text-slate-800 md:hidden">
                        {pageTitle}
                    </h1>
                </header>
                <div className="main-content flex-1 p-4 sm:p-6 md:p-8">
                    {children}
                </div>
            </main>
            {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}
        </div>
    );
}

