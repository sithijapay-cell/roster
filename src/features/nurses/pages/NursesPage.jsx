import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ExternalLink, FileText, Bell, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NursesPage = () => {
    // Mock Data mimicking health.gov.lk and other sources
    const newsItems = [
        {
            id: 1,
            title: "General Circular Letter No. 02-15/2025: Revised Overtime Rates",
            date: "2025-02-05",
            source: "Ministry of Health",
            link: "https://www.health.gov.lk",
            type: "Circular"
        },
        {
            id: 2,
            title: "Transfer Board Applications 2025 - Nursing Officers (Grade III)",
            date: "2025-01-28",
            source: "Health Service Committee",
            link: "#",
            type: "Transfer"
        },
        {
            id: 3,
            title: "Dengue Control Program - Sleeping Day Roster Instructions",
            date: "2025-01-15",
            source: "Epidemiology Unit",
            link: "#",
            type: "Notice"
        }
    ];

    const resources = [
        { title: "Leave Application Form", icon: FileText, desc: "Government Leave form A4", url: "/Government Leave form A4.pdf", download: "Government_Leave_Form.pdf" },
        { title: "Loan Application", icon: FileText, desc: "Distress Loan" },
        { title: "Railway Warrant", icon: FileText, desc: "Official Transport" },
        { title: "EB Exam Past Papers", icon: BookOpen, desc: "Grade III to II" },
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <Helmet>
                <title>Nurses Hub - Circulars & Resources | Sri Lankan Nurses Hub</title>
                <meta name="description" content="Stay updated with the latest Ministry of Health circulars, transfer notices, and download essential forms for Nursing Officers." />
            </Helmet>
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-primary">Nurses Hub</h1>
                <p className="text-muted-foreground">Latest circulars, news, and resources for Sri Lankan Nursing Officers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* News Feed - Main Content */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" /> Latest Updates
                        </h2>
                        <Button variant="ghost" className="text-primary text-sm">View All</Button>
                    </div>

                    {newsItems.map(item => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/50">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="text-xs font-semibold uppercase tracking-wider mb-1">
                                            <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px]">{item.type}</Badge>
                                            <span className="text-primary/80 ml-2">• {item.source}</span>
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                                        <div className="text-sm text-muted-foreground">{item.date}</div>
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="bg-primary/5 border-dashed">
                        <CardContent className="p-6 text-center space-y-2">
                            <p className="font-medium text-primary">Stay Updated!</p>
                            <p className="text-sm text-muted-foreground">Subscribe to get the latest Ministry circulars directly to your email.</p>
                            <Button className="w-full sm:w-auto">Subscribe to Newsletter</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Quick Links & Resources */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Resources</CardTitle>
                            <CardDescription>Essential downloads</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {resources.map((res, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    className="justify-start h-auto py-3 px-4 w-full text-left"
                                    asChild
                                >
                                    <a href={res.url || "#"} download={res.download} target={res.url ? "_blank" : undefined} rel={res.url ? "noreferrer" : undefined}>
                                        <res.icon className="h-5 w-5 mr-3 text-primary" />
                                        <div>
                                            <div className="font-medium">{res.title}</div>
                                            <div className="text-xs text-muted-foreground">{res.desc}</div>
                                        </div>
                                    </a>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-none shadow-sm">
                        <CardContent className="p-4 space-y-3">
                            <h3 className="font-semibold text-purple-900">Official Links</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="http://www.health.gov.lk" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-2">Ministry of Health <ExternalLink className="h-3 w-3" /></a></li>
                                <li><a href="#" className="text-primary hover:underline flex items-center gap-2">Nursing Council <ExternalLink className="h-3 w-3" /></a></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NursesPage;
