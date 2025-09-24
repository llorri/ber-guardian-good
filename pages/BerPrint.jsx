import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BER, IncidentReport } from '@/api/entities';
import BerReportCard from '@/components/ber/BerReportCard';
import IncidentReportCard from '@/components/incident/IncidentReportCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function BerPrint() {
    const location = useLocation();
    const [report, setReport] = useState(null);
    const [reportType, setReportType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportAndPrint = async () => {
            const params = new URLSearchParams(location.search);
            const id = params.get('id');
            const type = params.get('type') || 'ber'; // Default to ber if type not specified
            setReportType(type);

            if (id) {
                try {
                    let data;
                    if (type === 'incident_report') {
                        data = await IncidentReport.get(id);
                    } else {
                        data = await BER.get(id);
                    }
                    setReport(data);
                } catch (error) {
                    console.error(`Failed to fetch ${type} for printing:`, error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchReportAndPrint();
    }, [location.search]);
    
    useEffect(() => {
        if (!loading && report) {
            // Use a timeout to ensure content is rendered before printing
            const timer = setTimeout(() => {
                window.print();
            }, 500); // A small delay
            return () => clearTimeout(timer);
        }
    }, [loading, report]);

    if (loading) {
        return <Skeleton className="h-screen w-screen" />;
    }

    if (!report) {
        return <div className="p-10">Report not found.</div>;
    }

    const renderCard = () => {
        if (reportType === 'incident_report') {
            return <IncidentReportCard report={report} isPrinting={true} />;
        }
        return <BerReportCard ber={report} isPrinting={true} />;
    };

    return (
        <div id="ber-print-root">
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #ber-print-root, #ber-print-root * { visibility: visible !important; }
                    #ber-print-root { position: absolute; inset: 0; width: 100%; height: auto; }
                    @page { size: Letter portrait; margin: 12mm; }
                }
            `}</style>
            {renderCard()}
        </div>
    );
}