
import React, { useState, useEffect } from 'react';
import { BER, Task, Student, Staff } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { format, subDays, subYears, startOfDay, endOfDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BerReport() {
    const [bers, setBers] = useState([]);
    const [filteredBers, setFilteredBers] = useState([]);
    const [timeRange, setTimeRange] = useState('30');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        byPriority: [],
        byStatus: [],
        byMonth: [],
        bySite: []
    });

    // Fetch all BERs once on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch BERs, ordered by created_date
                const berData = await BER.list('-created_date');
                setBers(berData);
            } catch (error) {
                console.error('Failed to fetch report data:', error);
            } finally {
                // Set loading to false after the initial fetch is complete, regardless of success or failure.
                // This ensures the loading state reflects only the initial data retrieval.
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter BERs and process data for charts whenever bers or timeRange changes
    useEffect(() => {
        // If no BERs, or if initial load is still in progress (though setLoading(false)
        // in the first effect should handle this), clear data and return.
        // The `loading` state is now solely managed by the first `useEffect` for initial fetch.
        if (bers.length === 0) {
            setFilteredBers([]);
            setReportData({ byPriority: [], byStatus: [], byMonth: [], bySite: [] });
            return;
        }
        
        // No setLoading(true) or setLoading(false) here, as per the outline.
        // The loading state now primarily indicates the initial data fetch.

        const now = new Date();
        let startDate;

        switch (timeRange) {
            case '7':
                startDate = startOfDay(subDays(now, 7));
                break;
            case '30':
                startDate = startOfDay(subDays(now, 30));
                break;
            case '60':
                startDate = startOfDay(subDays(now, 60));
                break;
            case '90':
                startDate = startOfDay(subDays(now, 90));
                break;
            case '365':
                startDate = startOfDay(subYears(now, 1));
                break;
            default: // Default to last 30 days if timeRange is unexpected
                startDate = startOfDay(subDays(now, 30));
        }

        const excludedSites = ['southpine_elementary']; // Updated filter as per outline
        const filtered = bers.filter(ber => {
            // Date filtering
            if (!ber.created_date) return false;
            const berDate = new Date(ber.created_date);
            const isWithinDateRange = berDate >= startDate && berDate <= endOfDay(now);
            
            // Site filtering
            const isSiteExcluded = ber.site ? excludedSites.includes(ber.site.toLowerCase()) : false;
            
            return isWithinDateRange && !isSiteExcluded;
        });

        setFilteredBers(filtered);

        // Process data for charts using filtered data
        const priorityCounts = filtered.reduce((acc, ber) => {
            acc[ber.priority_level] = (acc[ber.priority_level] || 0) + 1;
            return acc;
        }, {});

        const statusCounts = filtered.reduce((acc, ber) => {
            acc[ber.status] = (acc[ber.status] || 0) + 1;
            return acc;
        }, {});

        const siteCounts = filtered.reduce((acc, ber) => {
            if (ber.site) {
                acc[ber.site] = (acc[ber.site] || 0) + 1;
            }
            return acc;
        }, {});

        // Generate monthly trend data from filtered BERs
        const monthlyData = [];
        // The outline's `monthsToShow` calculation results in 1 point for '7' days, and 6 points for all other ranges ('30', '60', '90', '365').
        // Each point represents incidents in a 30-day window centered at a point moving backwards from `now`.
        const monthsToShow = Math.min(6, parseInt(timeRange) / 30 * 6 || 6);

        for (let i = monthsToShow - 1; i >= 0; i--) {
            // monthDate represents the approximate center of a 30-day window, moving backwards from 'now'
            const monthDate = subDays(now, i * 30); 
            // Define a 30-day window centered around monthDate
            const monthStart = startOfDay(subDays(monthDate, 15));
            const monthEnd = endOfDay(subDays(monthDate, -15));
            
            const monthlyCount = filtered.filter(ber => {
                const berDate = new Date(ber.created_date);
                return berDate >= monthStart && berDate <= monthEnd;
            }).length;

            monthlyData.push({
                // Using 'MMM' for x-axis labels as specified in the outline
                month: format(monthDate, 'MMM'), 
                incidents: monthlyCount
            });
        }
        
        setReportData({
            byPriority: Object.entries(priorityCounts).map(([key, value]) => ({
                name: key,
                value
            })),
            byStatus: Object.entries(statusCounts).map(([key, value]) => ({
                name: key,
                count: value
            })),
            byMonth: monthlyData,
            bySite: Object.entries(siteCounts).map(([key, value]) => ({
                site: key,
                incidents: value
            }))
        });
    }, [bers, timeRange]);

    const getTimeRangeLabel = (range) => {
        switch (range) {
            case '7': return 'Last 7 days';
            case '30': return 'Last 30 days';
            case '60': return 'Last 60 days';
            case '90': return 'Last 90 days';
            case '365': return 'Last year';
            default: return 'Last 30 days';
        }
    };

    const exportReport = () => {
        // Create CSV content
        const csvRows = [];
        
        csvRows.push('BER Analytics Report');
        csvRows.push(`Generated: ${format(new Date(), 'MMM d, yyyy, h:mm a')}`);
        csvRows.push(`Time Period: ${getTimeRangeLabel(timeRange)}`);
        csvRows.push(`Total BERs: ${filteredBers.length}`);
        csvRows.push('');

        csvRows.push('Priority Breakdown:');
        csvRows.push('Priority,Count');
        reportData.byPriority.forEach(item => csvRows.push(`${item.name},${item.value}`));
        csvRows.push('');

        csvRows.push('Status Breakdown:');
        csvRows.push('Status,Count');
        reportData.byStatus.forEach(item => csvRows.push(`${item.name},${item.count}`));
        csvRows.push('');

        csvRows.push('Site Breakdown:');
        csvRows.push('Site,Incidents');
        reportData.bySite.forEach(item => csvRows.push(`${item.site},${item.incidents}`));
        csvRows.push('');

        csvRows.push('Detailed BER List:');
        csvRows.push('Student Name,Site,Date,Priority,Status');
        filteredBers.forEach(ber => {
            // Using placeholder for student_name as it's not directly on BER entity in provided code
            // Assuming ber.student_name or similar property exists, or needs to be joined.
            // For now, using a generic placeholder if not found.
            const studentName = ber.student?.name || ber.student_name || 'N/A'; 
            const formattedDate = ber.created_date ? format(new Date(ber.created_date), 'MMM d, yyyy') : 'N/A';
            csvRows.push(`"${studentName}","${ber.site || 'N/A'}","${formattedDate}","${ber.priority_level || 'N/A'}","${ber.status || 'N/A'}"`);
        });

        const csvContent = csvRows.join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `BER_Analytics_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const highPriorityCount = filteredBers.filter(b => b.priority_level === 'high' || b.priority_level === 'critical').length;
    const restraintsUsedCount = filteredBers.filter(b => b.restraint_used).length;
    const completedBersCount = filteredBers.filter(b => b.status === 'completed').length;


    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">BER Analytics</h1>
                    <p className="text-slate-600 mt-1">Comprehensive reporting and analytics for behavior incidents.</p>
                </div>
                <div className="flex gap-4">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="60">Last 60 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="h-5 w-5 mr-2" />
                        Export Report
                    </Button>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total BERs</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : filteredBers.length}</div>
                        <p className="text-xs text-muted-foreground">{getTimeRangeLabel(timeRange)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : highPriorityCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {loading ? <Skeleton className="h-4 w-24" /> : `${((highPriorityCount / Math.max(filteredBers.length, 1)) * 100).toFixed(1)}% of total`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Restraints Used</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : restraintsUsedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {loading ? <Skeleton className="h-4 w-24" /> : `${((restraintsUsedCount / Math.max(filteredBers.length, 1)) * 100).toFixed(1)}% of incidents`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed BERs</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : completedBersCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {loading ? <Skeleton className="h-4 w-24" /> : `${((completedBersCount / Math.max(filteredBers.length, 1)) * 100).toFixed(1)}% completion rate`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Incidents by Priority</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            {loading ? <Skeleton className="h-full w-full" /> :
                            reportData.byPriority.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={reportData.byPriority}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}`}
                                        >
                                            {reportData.byPriority.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted-foreground pt-10">No data available for this period.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Trend Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            {loading ? <Skeleton className="h-full w-full" /> :
                            reportData.byMonth.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={reportData.byMonth}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted-foreground pt-10">No data available for this period.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Incidents by Site</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        {loading ? <Skeleton className="h-full w-full" /> :
                        reportData.bySite.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.bySite}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="site" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="incidents" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-muted-foreground pt-10">No data available for this period.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
