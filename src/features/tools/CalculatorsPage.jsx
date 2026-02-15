import React, { useState } from 'react';
import { calculateIVRate, calculateBMI, calculateBSA } from ('../../utils/medicalCalculators');
import { Calculator, Activity, Droplets, Ruler } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';

const CalculatorsPage = () => {
    // IV State
    const [ivVolume, setIvVolume] = useState('');
    const [ivHours, setIvHours] = useState('');
    const [ivMinutes, setIvMinutes] = useState('0');
    const [ivDropFactor, setIvDropFactor] = useState('20');
    const [ivResult, setIvResult] = useState(null);

    // Body State
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmiResult, setBmiResult] = useState(null);
    const [bsaResult, setBsaResult] = useState(null);

    const handleCalculateIV = () => {
        const rate = calculateIVRate(ivVolume, ivHours, ivMinutes, ivDropFactor);
        setIvResult(rate);
    };

    const handleCalculateBody = () => {
        const bmi = calculateBMI(weight, height);
        const bsa = calculateBSA(weight, height);
        setBmiResult(bmi);
        setBsaResult(bsa);
    };

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-primary" />
                    Tools
                </h1>
                <p className="text-slate-500 mt-1">Offline medical calculators.</p>
            </div>

            <Tabs defaultValue="iv" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="iv" className="gap-2">
                        <Droplets className="w-4 h-4" /> IV Drip
                    </TabsTrigger>
                    <TabsTrigger value="body" className="gap-2">
                        <Activity className="w-4 h-4" /> BMI & BSA
                    </TabsTrigger>
                </TabsList>

                {/* IV Drip Calculator */}
                <TabsContent value="iv">
                    <Card>
                        <CardHeader>
                            <CardTitle>IV Drip Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="volume">Volume (ml)</Label>
                                <Input
                                    id="volume"
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={ivVolume}
                                    onChange={(e) => setIvVolume(e.target.value)}
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="hours">Hours</Label>
                                    <Input
                                        id="hours"
                                        type="number"
                                        placeholder="Hrs"
                                        value={ivHours}
                                        onChange={(e) => setIvHours(e.target.value)}
                                        inputMode="numeric"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="minutes">Minutes</Label>
                                    <Input
                                        id="minutes"
                                        type="number"
                                        placeholder="Mins"
                                        value={ivMinutes}
                                        onChange={(e) => setIvMinutes(e.target.value)}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dropFactor">Drop Factor (gtt/ml)</Label>
                                <select
                                    id="dropFactor"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={ivDropFactor}
                                    onChange={(e) => setIvDropFactor(e.target.value)}
                                >
                                    <option value="10">10 (Macro)</option>
                                    <option value="15">15 (Macro)</option>
                                    <option value="20">20 (Standard)</option>
                                    <option value="60">60 (Micro)</option>
                                </select>
                            </div>

                            <Button className="w-full mt-4" onClick={handleCalculateIV}>
                                Calculate Rate
                            </Button>

                            {ivResult !== null && (
                                <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center border border-primary/20">
                                    <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Flow Rate</div>
                                    <div className="text-4xl font-bold text-primary mt-1">
                                        {ivResult} <span className="text-lg text-muted-foreground font-normal">gtt/min</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Body Calculator */}
                <TabsContent value="body">
                    <Card>
                        <CardHeader>
                            <CardTitle>Body Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    placeholder="e.g. 70"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    inputMode="decimal"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    placeholder="e.g. 175"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    inputMode="numeric"
                                />
                            </div>

                            <Button className="w-full mt-4" onClick={handleCalculateBody}>
                                Calculate Metrics
                            </Button>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                {bmiResult && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border">
                                        <div className="text-xs text-muted-foreground uppercase font-bold">BMI</div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{bmiResult.value}</div>
                                        <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${bmiResult.category === 'Normal' ? 'bg-green-100 text-green-700' :
                                                bmiResult.category === 'Obese' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {bmiResult.category}
                                        </div>
                                    </div>
                                )}
                                {bsaResult && (
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border">
                                        <div className="text-xs text-muted-foreground uppercase font-bold">BSA</div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{bsaResult}</div>
                                        <div className="text-xs text-muted-foreground mt-1">m² (Mosteller)</div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CalculatorsPage;
