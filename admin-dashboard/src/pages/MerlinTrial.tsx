import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, Key, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TrialLog {
    id: number;
    hwid: string;
    used_count: number;
    last_collected_at: string;
    created_at: string;
}

export const MerlinTrial = () => {
    const [trials, setTrials] = useState<TrialLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTrials = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('trial_logs')
                .select('*')
                .order('last_collected_at', { ascending: false });

            if (error) throw error;
            setTrials(data || []);
        } catch (error) {
            console.error('Error fetching trials:', error);
            alert('체험판 기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (hwid: string) => {
        if (!confirm(`정말로 이 기기(${hwid})의 체험판 기록을 초기화하시겠습니까?\n앱 재시작 시 50건이 다시 충전됩니다.`)) return;
        
        try {
            const { error } = await supabase
                .from('trial_logs')
                .delete()
                .eq('hwid', hwid);
                
            if (error) throw error;
            alert('초기화 되었습니다.');
            fetchTrials();
        } catch (error) {
            console.error('Error deleting trial:', error);
            alert('초기화에 실패했습니다.');
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm('모든 체험판 기록을 전부 초기화하시겠습니까?')) return;
        
        try {
            // Delete all records requires a condition in Supabase JS, so we use not.eq
            const { error } = await supabase
                .from('trial_logs')
                .delete()
                .neq('hwid', 'placeholder-value-that-never-exists-12345');
                
            if (error) throw error;
            alert('모든 기록이 초기화 되었습니다.');
            fetchTrials();
        } catch (error) {
            console.error('Error deleting all trials:', error);
            alert('초기화에 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchTrials();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Key className="h-6 w-6 text-primary" />
                        멀린 체험판 관리
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        체험판(N-Place-DB) 사용 기록을 확인하고 초기화할 수 있습니다.
                    </p>
                </div>
                <Button 
                    onClick={handleDeleteAll} 
                    variant="destructive" 
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                    <Trash2 className="h-4 w-4" />
                    전체 초기화
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">HWID (기기 식별자)</th>
                                <th className="px-4 py-3">누적 사용량</th>
                                <th className="px-4 py-3">최근 수집일</th>
                                <th className="px-4 py-3 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            <span>데이터를 불러오는 중...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : trials.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        기록된 체험판 사용자가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                trials.map((trial) => (
                                    <tr key={trial.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs">{trial.hwid}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                trial.used_count >= 50 
                                                    ? 'bg-red-50 text-red-700' 
                                                    : 'bg-green-50 text-green-700'
                                            }`}>
                                                {trial.used_count} / 50건
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {format(new Date(trial.last_collected_at || trial.created_at), 'yyyy-MM-dd HH:mm')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                onClick={() => handleDelete(trial.hwid)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            >
                                                초기화
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
