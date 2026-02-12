import React, { useState, useEffect } from 'react';
import { useStore } from '../../../context/StoreContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card';

const ProfileForm = () => {
    const { profile, updateProfile } = useStore();
    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        designation: '',
        institution: '',
        salaryNumber: '',
        otRate: '',
        basicSalary: '',
        ward: ''
    });
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({ ...prev, ...profile }));
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfile(formData);
        setIsDirty(false);
        // Could add toast notification here
        alert("Profile saved successfully!");
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>
                    Fill in your details to enable overtime form generation.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name" name="name"
                                value={formData.name} onChange={handleChange}
                                placeholder="Enter your full name" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Input
                                id="grade" name="grade"
                                value={formData.grade} onChange={handleChange}
                                placeholder="e.g. Grade 1" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <Input
                                id="designation" name="designation"
                                value={formData.designation} onChange={handleChange}
                                placeholder="e.g. Nursing Officer" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="institution">Institution / Hospital</Label>
                            <Input
                                id="institution" name="institution"
                                value={formData.institution} onChange={handleChange}
                                placeholder="Hospital Name" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salaryNumber">Salary Number</Label>
                            <Input
                                id="salaryNumber" name="salaryNumber"
                                value={formData.salaryNumber} onChange={handleChange}
                                placeholder="Employee ID / Salary No" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="basicSalary">Basic Monthly Salary</Label>
                            <Input
                                id="basicSalary" name="basicSalary" type="number" step="0.01"
                                value={formData.basicSalary} onChange={handleChange}
                                placeholder="Basic Salary" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="otRate">OT Rate (Hourly)</Label>
                            <Input
                                id="otRate" name="otRate" type="number" step="0.01"
                                value={formData.otRate} onChange={handleChange}
                                placeholder="Hourly Rate" required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ward">Ward Number</Label>
                            <Input
                                id="ward" name="ward"
                                value={formData.ward} onChange={handleChange}
                                placeholder="e.g. Ward 12"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={!isDirty}>
                        Save Profile
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default ProfileForm;
