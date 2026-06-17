import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Loader2, Shield, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';

interface License {
    id: string;
    serial_key: string;
    product_id: string;
    buyer_name: string;
    status: 'active' | 'used' | 'unused' | 'expired' | 'blocked';
    expire_date: string;
    created_at: string;
    contact?: string;
    license_type?: string;
    price_sold?: number;
}

interface DbUser {
    id?: string;
    email: string;
    uid?: string;
    role: string;
    name?: string;      // DB 컬럼명 유지, 실제 의미는 크몽 ID
    channel?: string;
    memo?: string;
    created_at: string;
}

export const UserList = () => {
    const [users, setUsers] = useState<DbUser[]>([]);
    const [allLicenses, setAllLicenses] = useState<License[]>([]);
    const [loading, setLoading] = useState(true);
    
    // User search & filters
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'buyer' | 'non-buyer'>('all');
    
    // Modals
    const [showAdminModal, setShowAdminModal] = useState(false);
    
    // Approve Modal states
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedUserForMapping, setSelectedUserForMapping] = useState<DbUser | null>(null);
    const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
    const [selectedLicenseId, setSelectedLicenseId] = useState('');
    const [licenseSearchTerm, setLicenseSearchTerm] = useState('');
    const [isLoadingLicenses, setIsLoadingLicenses] = useState(false);

    const fetchData = async () => {
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            if (usersError) throw usersError;
            setUsers(usersData || []);

            const { data: licensesData, error: licensesError } = await supabase
                .from('licenses')
                .select('*')
                .order('created_at', { ascending: false });
            if (licensesError) throw licensesError;
            setAllLicenses(licensesData || []);

            // [자동 매칭 로직]: 일반회원의 이메일과 라이선스의 이메일이 일치하면 자동으로 구매자로 전환
            const currentUsers = usersData || [];
            const currentLicenses = licensesData || [];
            const nonBuyers = currentUsers.filter((u: DbUser) => u.role === 'user' || !u.role);
            
            for (const user of nonBuyers) {
                const matchedLicense = currentLicenses.find((l: License) => 
                    l.contact && l.contact.trim() !== '' && l.contact.toLowerCase() === user.email.toLowerCase()
                );
                
                if (matchedLicense) {
                    try {
                        await supabase
                            .from('users')
                            .update({ role: 'buyer', channel: 'Direct' })
                            .eq('email', user.email);
                    } catch (err) {
                        console.error('Auto match failed for', user.email, err);
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const channel = supabase
            .channel('user-list-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'licenses' }, fetchData)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const adminUsers = users.filter(u => u.role === 'admin');
    const nonAdminUsers = users.filter(u => u.role !== 'admin');

    const totalMembers = nonAdminUsers.length;
    const buyersCount = nonAdminUsers.filter(u => u.role === 'buyer' || allLicenses.some(l => l.contact?.toLowerCase() === u.email?.toLowerCase())).length;
    const generalMembersCount = totalMembers - buyersCount;

    const filteredUsers = nonAdminUsers.filter(u => {
        const nameMatch = (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase());
        const emailMatch = (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;

        const isBuyer = u.role === 'buyer' || allLicenses.some(l => l.contact?.toLowerCase() === u.email?.toLowerCase());

        if (userRoleFilter === 'buyer') return matchesSearch && isBuyer;
        if (userRoleFilter === 'non-buyer') return matchesSearch && !isBuyer;
        
        return matchesSearch;
    });

    const getUserType = (u: DbUser) => {
        const isBuyer = u.role === 'buyer' || allLicenses.some(l => l.contact?.toLowerCase() === u.email?.toLowerCase());
        if (isBuyer) {
            return { label: '구매자', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        }
        return { label: '비구매자', color: 'bg-slate-50 text-slate-500 border-slate-200' };
    };

    // License Matching Actions
    const handleOpenApproveModal = async (userObj: DbUser) => {
        setSelectedUserForMapping(userObj);
        setIsApproveModalOpen(true);
        setIsLoadingLicenses(true);
        setLicenseSearchTerm('');
        setSelectedLicenseId('');
        
        try {
            const { data, error } = await supabase
                .from('licenses')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // 모든 라이선스를 불러와서 관리자가 직접 '크몽 ID' 등을 검색하여 매칭할 수 있도록 허용
            const filtered = data || [];

            setAvailableLicenses(filtered as License[]);
            
            // Auto-select exact matching buyer_name or contact
            const exactMatch = filtered.find(lic => 
                (lic.buyer_name && userObj.name && lic.buyer_name.toLowerCase() === userObj.name.toLowerCase()) ||
                (lic.contact && lic.contact.toLowerCase() === userObj.email.toLowerCase())
            );
            if (exactMatch) {
                setSelectedLicenseId(exactMatch.id);
            }
        } catch (err) {
            console.error("Error fetching licenses for mapping:", err);
        } finally {
            setIsLoadingLicenses(false);
        }
    };

    const handleApproveAndMap = async () => {
        if (!selectedUserForMapping) return;
        if (!selectedLicenseId) {
            alert("매칭할 라이선스를 선택해주세요.");
            return;
        }

        try {
            const { error: licError } = await supabase
                .from('licenses')
                .update({ 
                    contact: selectedUserForMapping.email.toLowerCase(),
                    buyer_name: selectedUserForMapping.name || selectedUserForMapping.email.split('@')[0]
                })
                .eq('id', selectedLicenseId);

            if (licError) throw licError;

            const nextChannel = selectedUserForMapping.channel 
                ? selectedUserForMapping.channel.replace(/\s*\(Pending\)/g, '') 
                : 'Direct';
            
            const { error: userError } = await supabase
                .from('users')
                .update({ 
                    role: 'buyer',
                    channel: nextChannel 
                })
                .eq('email', selectedUserForMapping.email);

            if (userError) throw userError;

            alert("라이선스 매칭 및 구매자 전환 승인이 완료되었습니다.");
            setIsApproveModalOpen(false);
            await fetchData();
        } catch (err: any) {
            console.error("Error mapping license to user:", err);
            alert(`승인 처리 중 오류 발생: ${err.message}`);
        }
    };

    const handleEditUserMemo = async (userEmail: string | undefined, currentMemo: string | undefined, userName: string | undefined) => {
        if (!userEmail) return;
        const newMemo = window.prompt(`"${userName || '이름 없음'}" 회원의 메모 작성/수정:`, currentMemo || '');
        if (newMemo === null) return;
        try {
            const { error } = await supabase.from('users').update({ memo: newMemo }).eq('email', userEmail);
            if (error) {
                if (error.code === '42703') throw new Error('데이터베이스에 memo 컬럼이 존재하지 않습니다. 먼저 추가해주세요.');
                throw error;
            }
            fetchData();
        } catch (err: any) {
            alert(`메모 저장 오류: ${err.message}`);
        }
    };

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
                </div>
            </div>

            {/* General Member Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">총 가입 고객</p>
                    <h4 className="text-2xl font-black text-slate-800">{totalMembers}</h4>
                </Card>
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">현재 일반회원</p>
                    <h4 className="text-2xl font-black text-indigo-600">{generalMembersCount}</h4>
                </Card>
                <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">구매자 전환</p>
                    <h4 className="text-2xl font-black text-emerald-600">{buyersCount}</h4>
                </Card>
            </div>

            {/* User List Table (with Tabs) */}
            <Card className="p-5 bg-white border border-slate-300 shadow-[0_15px_45px_rgba(0,0,0,0.08)] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                            <UsersIcon className="w-4.5 h-4.5 text-indigo-650" />
                            <h3 className="text-base font-black text-slate-800">앱가입 고객 리스트</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setUserRoleFilter('all')} className={cn("px-3 py-1.5 text-[11px] font-black rounded-lg transition-colors", userRoleFilter === 'all' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>전체보기</button>
                            <button onClick={() => setUserRoleFilter('non-buyer')} className={cn("px-3 py-1.5 text-[11px] font-black rounded-lg transition-colors", userRoleFilter === 'non-buyer' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>일반회원 (무료)</button>
                            <button onClick={() => setUserRoleFilter('buyer')} className={cn("px-3 py-1.5 text-[11px] font-black rounded-lg transition-colors", userRoleFilter === 'buyer' ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>구매자 (유료)</button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <Input
                                placeholder="크몽 ID 또는 이메일 검색..."
                                value={userSearchTerm}
                                onChange={e => setUserSearchTerm(e.target.value)}
                                className="pl-8 h-9 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto border border-slate-400 rounded-xl shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead className="bg-slate-900 text-white">
                            <tr className="text-sm font-black uppercase tracking-wider text-left whitespace-nowrap">
                                <th className="px-3 py-3 w-12 text-center text-slate-200">번호</th>
                                <th className="px-3 py-3 text-slate-200">가입일자</th>
                                <th className="px-3 py-3 text-slate-200">크몽 ID</th>
                                <th className="px-3 py-3 text-slate-200">이메일</th>
                                <th className="px-3 py-3 text-slate-200">메모</th>
                                <th className="px-3 py-3 text-right text-slate-200">라이선스 제어</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 text-xs font-semibold whitespace-nowrap">
                            {loading ? (
                                <tr><td colSpan={5} className="py-14 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-200" /></td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((u, idx) => {
                                    const type = getUserType(u);
                                    const isNonBuyer = type.label === '비구매자';
                                    return (
                                        <tr key={u.email} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-3 py-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                                            <td className="px-3 py-2 text-slate-500 font-bold">
                                                {u.created_at ? format(new Date(u.created_at), 'yyyy.MM.dd HH:mm') : '-'}
                                            </td>
                                            <td className="px-3 py-2 font-black text-slate-700">{u.name || '이름 없음'}</td>
                                            <td className="px-3 py-2 text-slate-600 font-mono">{u.email}</td>
                                            <td className="px-3 py-2 text-slate-600 max-w-[150px] truncate cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleEditUserMemo(u.email, u.memo, u.name)}>
                                                {u.memo ? <span className="text-xs">{u.memo}</span> : <span className="text-[10px] text-slate-400 border border-dashed border-slate-300 px-1.5 py-0.5 rounded">작성</span>}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {u.role !== 'admin' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenApproveModal(u)}
                                                        className={cn(
                                                            "h-7 px-2.5 text-[10px] font-black rounded-lg transition-all",
                                                            isNonBuyer
                                                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100"
                                                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                                                        )}
                                                    >
                                                        {isNonBuyer ? "라이선스 매칭" : "추가 매칭"}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400 font-bold">가입 회원이 존재하지 않거나 검색 결과가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Admin Modal */}
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

            {/* Approve/Match License Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="라이선스 수동 매칭 및 승인">
                <div className="space-y-5">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                        <p className="text-xs font-bold text-slate-500 mb-1">매칭 대상 회원</p>
                        <p className="text-sm font-black text-slate-800">{selectedUserForMapping?.name || selectedUserForMapping?.email}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">사용 가능한 라이선스 선택 (이메일 매칭)</label>
                        <Input
                            placeholder="라이선스 구매자 검색..."
                            value={licenseSearchTerm}
                            onChange={(e) => setLicenseSearchTerm(e.target.value)}
                            className="h-9 text-xs mb-2"
                        />
                        
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                            {isLoadingLicenses ? (
                                <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" /></div>
                            ) : availableLicenses.filter(lic => 
                                (lic.buyer_name || '').toLowerCase().includes(licenseSearchTerm.toLowerCase()) || 
                                (lic.contact || '').toLowerCase().includes(licenseSearchTerm.toLowerCase()) ||
                                (lic.serial_key || '').toLowerCase().includes(licenseSearchTerm.toLowerCase())
                            ).length > 0 ? (
                                availableLicenses.filter(lic => 
                                    (lic.buyer_name || '').toLowerCase().includes(licenseSearchTerm.toLowerCase()) || 
                                    (lic.contact || '').toLowerCase().includes(licenseSearchTerm.toLowerCase()) ||
                                    (lic.serial_key || '').toLowerCase().includes(licenseSearchTerm.toLowerCase())
                                ).map(lic => (
                                    <div 
                                        key={lic.id}
                                        onClick={() => setSelectedLicenseId(lic.id)}
                                        className={cn(
                                            "p-3 border-b border-slate-100 last:border-0 cursor-pointer transition-colors hover:bg-indigo-50/50 flex flex-col gap-1",
                                            selectedLicenseId === lic.id ? "bg-indigo-50 border-l-4 border-l-indigo-600" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-black text-slate-800">{lic.buyer_name} <span className="font-normal text-slate-500">({lic.license_type || '기본'})</span></span>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{lic.status}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500">{lic.serial_key}</span>
                                        {lic.contact && <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">매칭된 이메일: {lic.contact}</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-500 font-medium">검색된 라이선스가 없습니다.</div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">※ '구매자 이름' 또는 '매칭된 이메일'을 기반으로 검색됩니다.</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)} className="h-9 text-xs">취소</Button>
                        <Button onClick={handleApproveAndMap} className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                            선택한 라이선스로 매칭
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
