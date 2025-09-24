
import React, { useState, useEffect } from 'react';
import { BER } from '@/api/entities';
import { Task } from '@/api/entities';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

export default function Dashboard() {
    const [stats, setStats] = useState({ 
        totalBERs: 0, 
        pendingTasks: 0, 
        overdueTasks: 0,
        completedThisWeek: 0
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [bers, tasks] = await Promise.all([
                    BER.list().catch(e => { console.error("Failed to fetch BERs:", e); return []; }),
                    Task.list().catch(e => { console.error("Failed to fetch Tasks:", e); return []; })
                ]);

                const pendingTasks = tasks.filter(t => t.status === 'pending').length;
                const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
                const completedTasks = tasks.filter(t => t.status === 'completed').length;

                setStats({
                    totalBERs: bers.length,
                    pendingTasks,
                    overdueTasks,
                    completedThisWeek: completedTasks
                });
                
                const siteData = [
                    { name: 'Ideal', incidents: 8 }
                ];
                setChartData(siteData);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError('Unable to load dashboard data. Some information may be missing.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Executive Dashboard</h1>
                <p className="text-slate-600 mt-1">Real-time overview of behavior incidents and compliance status.</p>
            </header>

            {error && (
                 <Card>
                    <CardContent className="p-6">
                        <div className="text-center py-4">
                            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-yellow-600">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />) : <>
                    <StatCard title="Total BERs (Last 30 Days)" value={stats.totalBERs} icon={ShieldAlert} color="text-blue-600" />
                    <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="text-yellow-600" />
                    <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon={AlertTriangle} color="text-red-600" />
                    <StatCard title="Completed This Week" value={stats.completedThisWeek} icon={TrendingUp} color="text-green-600" />
                </>}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Incidents by Site</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        {loading ? <Skeleton className="h-full w-full" /> : 
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
