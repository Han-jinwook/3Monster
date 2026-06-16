import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Loader2, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DbUser {
    email: string;
    uid?: string;
    role: string;
    name?: string;      // DB 컬럼명 유지, 실제 의미는 크몽 ID
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

        if (error) console.error('Error fetching users:', error);
        else setUsers(data as DbUser[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
        const channel = supabase
            .channel('user-list-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const generalUsers = users.filter(u => u.role !== 'admin');
    const adminUsers = users.filter(u => u.role === 'admin');

    const filteredUsers = generalUsers.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">일반 회원 관리</h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowAdminModal(true)}
                        className="h-10 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold px-5 border border-indigo-200 shadow-sm rounded-xl"
                    >
                        <Shield className="w-4 h-4 mr-1.5" />
                        관리자 명단
                    </Button>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="크몽 ID 또는 이메일 검색"
                            className="pl-11 bg-white border border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 text-sm font-bold rounded-xl h-10"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden p-0 border border-slate-200 shadow-[0_15px_45px_rgba(0,0,0,0.07)] rounded-2xl bg-white">
                <table className="w-full">
                    <colgroup>
                        <col style={{ width: '10%' }} />  {/* 구분 */}
                        <col style={{ width: '13%' }} />  {/* 크몽 ID */}
                        <col style={{ width: '20%' }} />  {/* 이메일 */}
                        <col style={{ width: '14%' }} />  {/* 가입날짜 */}
                    </colgroup>
                    <thead className="bg-slate-900 text-white">
                        <tr className="text-[11px] font-black uppercase tracking-wide text-left">
                            <th className="px-4 py-2.5 text-slate-200">구분 (채널)</th>
                            <th className="px-4 py-2.5 text-slate-200">크몽 ID</th>
                            <th className="px-4 py-2.5 text-slate-200">이메일</th>
                            <th className="px-4 py-2.5 text-slate-200">가입날짜</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {loading ? (
                            <tr><td colSpan={4} className="py-14 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-200" /></td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.email} className="hover:bg-slate-50/60 transition-colors align-middle">

                                {/* 구분 */}
                                <td className="px-4 py-2">
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200 rounded-md uppercase">
                                        {user.role}{user.channel && ` (${user.channel})`}
                                    </span>
                                </td>

                                {/* 크몽 ID */}
                                <td className="px-4 py-2 font-bold text-slate-800 truncate">
                                    {user.name || <span className="text-slate-300">-</span>}
                                </td>

                                {/* 이메일 */}
                                <td className="px-4 py-2 text-slate-500 truncate">
                                    {user.email}
                                </td>

                                {/* 가입날짜 */}
                                <td className="px-4 py-2 font-bold text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                        {user.created_at ? format(new Date(user.created_at), 'yyyy.MM.dd HH:mm') : '-'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && filteredUsers.length === 0 && (
                            <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-medium">검색된 회원이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* 관리자 명단 모달 */}
            {showAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-600" />
                                관리자 명단
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowAdminModal(false)} className="w-8 h-8 rounded-full">✕</Button>
                        </div>
                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-3">
                                {adminUsers.map(admin => (
                                    <div key={admin.email} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-slate-800 text-sm">{admin.name || '최고 관리자'}</span>
                                            <span className="text-xs text-slate-500">{admin.email}</span>
                                        </div>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md uppercase">ADMIN</span>
                                    </div>
                                ))}
                                {adminUsers.length === 0 && (
                                    <p className="text-center text-slate-500 py-4 text-sm">등록된 관리자가 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
