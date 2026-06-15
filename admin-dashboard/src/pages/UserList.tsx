import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Loader2, User, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DbUser {
    email: string;
    uid?: string;
    role: string;
    name?: string;
    channel?: string;
    created_at: string;
}

export const UserList = () => {
    const [users, setUsers] = useState<DbUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdminModal, setShowAdminModal] = useState(false);

    const fetchUsers = async () => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data as DbUser[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();

        const channel = supabase
            .channel('user-list-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                fetchUsers();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const generalUsers = users.filter(u => u.role !== 'admin');
    const adminUsers = users.filter(u => u.role === 'admin');

    const filteredUsers = generalUsers.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">일반 회원 관리</h1>
                </div>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => setShowAdminModal(true)}
                        className="h-12 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-6 border border-indigo-200 shadow-sm"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        관리자 명단
                    </Button>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="회원 이름 또는 이메일 검색"
                            className="pl-11 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm font-bold rounded-xl h-12"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden p-0 border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl bg-white">
                <table className="w-full">
                    <thead className="bg-slate-900 text-white">
                        <tr className="text-sm font-black uppercase tracking-wider text-left">
                            <th className="px-10 py-3 text-slate-200">회원 구분 (채널)</th>
                            <th className="px-10 py-3 text-slate-200">이름 / 이메일</th>
                            <th className="px-10 py-3 text-slate-200">가입날짜</th>
                            <th className="px-10 py-3 text-right text-slate-200">고유 UID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                        {loading ? (
                            <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-200" /></td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.email} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-black border border-slate-200 rounded-md uppercase">
                                        {user.role} {user.channel && `(${user.channel})`}
                                    </span>
                                </td>
                                <td className="px-10 py-4 font-black text-slate-800">
                                    <div className="flex flex-col">
                                        <span>{user.name || '이름 없음'}</span>
                                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                            <User className="w-3 h-3" /> {user.email}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-10 py-4 text-sm font-bold text-slate-550">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {user.created_at ? format(new Date(user.created_at), 'yyyy.MM.dd HH:mm') : '-'}
                                    </div>
                                </td>
                                <td className="px-10 py-4 text-right">
                                    <span className="text-[11px] font-mono text-slate-400">{user.uid || '미연동'}</span>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-16 text-center text-slate-500 font-medium">검색된 회원이 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Admin Modal */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                관리자 명단
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAdminModal(false)} className="w-8 h-8 rounded-full">
                                ✕
                            </Button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                {adminUsers.map(admin => (
                                    <div key={admin.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800">{admin.name || '최고 관리자'}</span>
                                            <span className="text-sm text-slate-500 font-medium">{admin.email}</span>
                                        </div>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-black rounded-md uppercase">ADMIN</span>
                                    </div>
                                ))}
                                {adminUsers.length === 0 && (
                                    <p className="text-center text-slate-500 py-4">등록된 관리자가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
