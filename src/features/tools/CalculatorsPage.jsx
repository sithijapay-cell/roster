/* eslint-disable */
import React, { useState } from 'react';
import { calculateIVRate, calculateBMI, calculateBSA, calculateMAP, GCS_SCALES } from '../../utils/medicalCalculators';
import { Calculator, Activity, Droplets, HeartPulse, Brain } from 'lucide-react';
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
    const [ivError, setIvError] = useState(null);

    // Body State
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [bmiResult, setBmiResult] = useState(null);
    const [bsaResult, setBsaResult] = useState(null);
    const [bodyError, setBodyError] = useState(null);

    // MAP State
    const [sbp, setSbp] = useState('');
    const [dbp, setDbp] = useState('');
    const [mapResult, setMapResult] = useState(null);

    // GCS State
    const [eye, setEye] = useState(4);
    const [verbal, setVerbal] = useState(5);
    const [motor, setMotor] = useState(6);

    const handleCalculateIV = () => {
        setIvError(null);
        const rate = calculateIVRate(ivVolume, ivHours, ivMinutes, ivDropFactor);
        if (rate === 0 && (ivVolume > 0)) {
            setIvError('Invalid input');
            return;
        }
        setIvResult(rate);
    };

    const handleCalculateBody = () => {
        setBodyError(null);
        const bmi = calculateBMI(weight, height);
        const bsa = calculateBSA(weight, height);
        setBmiResult(bmi);
        setBsaResult(bsa);
    };

    const handleCalculateMAP = () => {
        const res = calculateMAP(sbp, dbp);
        setMapResult(res);
    };

    const gcsTotal = eye + verbal + motor;

    return (
        <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <Calculator className="w-8 h-8 text-primary" />
                    Medical Tools
                </h1>
                <p className="text-muted-foreground mt-1">Clinical calculators for daily use.</p>
            </div>

            <Tabs defaultValue="iv" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="iv" className="gap-1 p-2">
                        <Droplets className="w-4 h-4" /> <span className="hidden sm:inline">IV</span>
                    </TabsTrigger>
                    <TabsTrigger value="body" className="gap-1 p-2">
                        <Activity className="w-4 h-4" /> <span className="hidden sm:inline">BMI</span>
                    </TabsTrigger>
                    <TabsTrigger value="map" className="gap-1 p-2">
                        <HeartPulse className="w-4 h-4" /> <span className="hidden sm:inline">MAP</span>
                    </TabsTrigger>
                    <TabsTrigger value="gcs" className="gap-1 p-2">
                        <Brain className="w-4 h-4" /> <span className="hidden sm:inline">GCS</span>
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
                                <Label>Volume (ml)</Label>
                                <Input type="number" value={ivVolume} onChange={(e) => setIvVolume(e.target.value)} placeholder="500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Hours</Label>
                                    <Input type="number" value={ivHours} onChange={(e) => setIvHours(e.target.value)} placeholder="8" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Minutes</Label>
                                    <Input type="number" value={ivMinutes} onChange={(e) => setIvMinutes(e.target.value)} placeholder="0" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Drop Factor</Label>
                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={ivDropFactor} onChange={(e) => setIvDropFactor(e.target.value)}>
                                    <option value="10">10 (Macro)</option>
                                    <option value="15">15 (Macro)</option>
                                    <option value="20">20 (Standard)</option>
                                    <option value="60">60 (Micro)</option>
                                </select>
                            </div>
                            <Button className="w-full mt-4" onClick={handleCalculateIV}>Calculate</Button>
                            {ivResult !== null && ivResult > 0 && (
                                <div className="mt-4 p-4 bg-primary/10 rounded-xl text-center">
                                    <div className="text-4xl font-bold text-primary">{ivResult}</div>
                                    <div className="text-sm text-muted-foreground">gtt/min</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* BMI & BSA */}
                <TabsContent value="body">
                    <Card>
                        <CardHeader>
                            <CardTitle>BMI & BSA</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Weight (kg)</Label>
                                <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Height (cm)</Label>
                                <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                            </div>
                            <Button className="w-full mt-4" onClick={handleCalculateBody}>Calculate</Button>
                            {(bmiResult || bsaResult) && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="p-4 bg-muted rounded-xl text-center">
                                        <div className="text-xs font-bold uppercase text-muted-foreground">BMI</div>
                                        <div className="text-2xl font-bold mt-1">{bmiResult?.value}</div>
                                        <div className="text-xs text-primary">{bmiResult?.category}</div>
                                    </div>
                                    <div className="p-4 bg-muted rounded-xl text-center">
                                        <div className="text-xs font-bold uppercase text-muted-foreground">BSA</div>
                                        <div className="text-2xl font-bold mt-1">{bsaResult}</div>
                                        <div className="text-xs">m²</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MAP Calculator */}
                <TabsContent value="map">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mean Arterial Pressure</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Systolic BP (mmHg)</Label>
                                <Input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} placeholder="120" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Diastolic BP (mmHg)</Label>
                                <Input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} placeholder="80" />
                            </div>
                            <Button className="w-full mt-4" onClick={handleCalculateMAP}>Calculate MAP</Button>
                            {mapResult !== null && (
                                <div className="mt-4 p-4 bg-primary/10 rounded-xl text-center">
                                    <div className="text-4xl font-bold text-primary">{mapResult}</div>
                                    <div className="text-sm text-muted-foreground">mmHg</div>
                                    <div className="text-xs text-muted-foreground mt-2">Normal Range: 70-100 mmHg</div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GCS Calculator */}
                <TabsContent value="gcs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Glasgow Coma Scale</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label>Eye Response (E)</Label>
                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={eye} onChange={(e) => setEye(Number(e.target.value))}>
                                    {GCS_SCALES.eye.map(opt => <option key={opt.score} value={opt.score}>{opt.score} - {opt.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Verbal Response (V)</Label>
                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={verbal} onChange={(e) => setVerbal(Number(e.target.value))}>
                                    {GCS_SCALES.verbal.map(opt => <option key={opt.score} value={opt.score}>{opt.score} - {opt.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Motor Response (M)</Label>
                                <select className="flex h-10 w-full rounded-md border bg-background px-3" value={motor} onChange={(e) => setMotor(Number(e.target.value))}>
                                    {GCS_SCALES.motor.map(opt => <option key={opt.score} value={opt.score}>{opt.score} - {opt.label}</option>)}
                                </select>
                            </div>

                            <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center border border-primary/20">
                                <div className="text-sm text-muted-foreground uppercase font-bold">Total GCS Score</div>
                                <div className={`text-5xl font-bold mt-2 ${gcsTotal <= 8 ? 'text-destructive' : 'text-primary'}`}>
                                    {gcsTotal}<span className="text-lg text-muted-foreground">/15</span>
                                </div>
                                <div className="text-xs font-bold mt-2">
                                    E{eye} V{verbal} M{motor}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-primary/10">
                                    {gcsTotal <= 8 ? 'Severe Head Injury (Coma)' : gcsTotal <= 12 ? 'Moderate Head Injury' : 'Minor Head Injury'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default CalculatorsPage;
