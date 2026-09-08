import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Key, Users, LogOut, HelpCircle, Bell, Video } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
    const { logout, role } = useAuth();

    const adminNavItems = [
        { icon: LayoutDashboard, label: '대시보드', href: '/admin' },
        { icon: Key, label: '라이선스 키 발행', href: '/admin/generator' },
        { icon: Users, label: '구매자 관리', href: '/admin/licenses' },
        { icon: Users, label: '일반 회원', href: '/admin/users' },
        { icon: Bell, label: '알림 관리', href: '/admin/notifications' },
        { icon: HelpCircle, label: '고객센터', href: '/support' },
        { icon: Key, label: '체험판 현황', href: '/admin/merlin-trial' },
        { icon: Video, label: '숏폼 스튜디오', href: '/admin/shorts-studio' },
    ];

    const buyerNavItems = [
        { icon: LayoutDashboard, label: '쇼룸 (홈)', href: '/' },
        { icon: HelpCircle, label: '고객센터', href: '/support' },
    ];

    const navItems = role === 'admin' ? adminNavItems : buyerNavItems;
    return (
        <aside className="fixed top-20 bottom-0 left-0 z-40 w-44 transform bg-white transition-transform duration-300 lg:translate-x-0 border-r border-slate-200/80 shadow-xs">
            <div className="flex flex-col h-full py-4 px-3">
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end
                            className={({ isActive }) =>
                                cn(
                                    "group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-[13px] font-bold transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 font-black shadow-xs"
                                        : "text-slate-700 hover:text-slate-950 hover:bg-slate-100/70"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-900")} />
                                    <span className="truncate">{item.label}</span>
                                    {isActive && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-indigo-600 rounded-l-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {role !== 'admin' && (
                    <div className="mt-auto">
                        <button
                            onClick={() => logout()}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs sm:text-[13px] font-bold text-slate-600 transition-all duration-200 hover:text-slate-950 hover:bg-slate-100 group cursor-pointer"
                        >
                            <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-slate-700" />
                            로그아웃
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
};
