import React, { useState, useMemo } from 'react';
import { useStore } from '../../../context/StoreContext';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { generatePDF } from '../../../services/pdfService';
import { calculateRosterStats } from '../../../utils/rosterCalculations';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/Card';
import { ChevronLeft, ChevronRight, FileDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

const OTPage = () => {
    const { profile, shifts } = useStore();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Navigation
    const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
    const nextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

    // Calculate Stats for Preview
    const stats = useMemo(() => {
        return calculateRosterStats(shifts, selectedMonth);
    }, [shifts, selectedMonth]);

    const isProfileComplete = useMemo(() => {
        return profile?.name && profile?.grade && profile?.ward;
    }, [profile]);

    const handleDownload = async () => {
        if (!isProfileComplete) return;

        setLoading(true);
        try {
            const pdfBytes = await generatePDF(profile, shifts, selectedMonth);

            if (!pdfBytes) throw new Error("No data generated");

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `OT_Claim_${profile.name || 'Nurse'}_${format(selectedMonth, 'MMM_yyyy')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">OT Management</h2>
                    <p className="text-muted-foreground">Generate and download your Form 108 claims.</p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center gap-2 bg-card p-1 rounded-lg border shadow-sm self-start md:self-auto">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="w-40 text-center font-semibold text-lg">
                        {format(selectedMonth, 'MMMM yyyy')}
                    </div>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Summary
                            <Badge variant="outline" className="ml-auto font-normal">
                                {format(selectedMonth, 'MMM yyyy')}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex flex-col">
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Duty</span>
                                <span className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.monthlyStats.box1} <span className="text-sm font-normal">hrs</span></span>
                            </div>
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg flex flex-col">
                                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Est. OT Claim</span>
                                <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{stats.monthlyStats.box4 || 0} <span className="text-sm font-normal">hrs</span></span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium mb-2">Breakdown</h4>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-muted-foreground">Normal OT Hours</span>
                                <span className="font-medium">{stats.monthlyStats.box2} hrs</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-muted-foreground">Extra Duty Hours</span>
                                <span className="font-medium">{stats.monthlyStats.extraHours || 0} hrs</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Card */}
                <Card className={!isProfileComplete ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/10" : ""}>
                    <CardHeader>
                        <CardTitle>Download Claim Form</CardTitle>
                        <CardDescription>
                            Generate the official Form 108 PDF with your shift data filled in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isProfileComplete ? (
                            <div className="flex items-start gap-3 p-4 bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 rounded-lg text-sm">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Profile Incomplete</p>
                                    <p className="mt-1 opacity-90">
                                        You need to fill in your Name, Grade, and Ward in the Profile section before generating the form.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 p-4 bg-green-100/50 text-green-800 dark:bg-green-900/20 dark:text-green-200 rounded-lg text-sm">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-semibold">Ready to Generate</p>
                                    <p className="mt-1 opacity-90">
                                        Your profile is complete. Click below to download.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {isProfileComplete ? (
                            <Button className="w-full h-12 text-lg gap-2 shadow-lg" onClick={handleDownload} disabled={loading} loading={loading}>
                                <FileDown className="w-5 h-5" />
                                {loading ? "Generating..." : "Download Form 108"}
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100" onClick={() => window.location.href = '/roster/profile'}>
                                Go to Profile
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default OTPage;
