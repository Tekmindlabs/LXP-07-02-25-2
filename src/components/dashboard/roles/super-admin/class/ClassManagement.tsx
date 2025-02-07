'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Status } from "@prisma/client";
import { api } from "@/trpc/react";
import { ClassList } from "./ClassList";
import { ClassForm } from "./ClassForm";
import { Class } from "@/types/class";
import { LuUsers, LuBookOpen, LuGraduationCap, LuUserCheck } from "react-icons/lu";

interface SearchFilters {
    search: string;
    classGroupId?: string;
    teacherId?: string;
    status?: Status;
}

export const ClassManagement = () => {
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        search: "",
    });

    const { data: classesData, isLoading: classesLoading } = api.class.searchClasses.useQuery(filters);
    const { data: classGroupsData, isLoading: groupsLoading } = api.classGroup.getAllClassGroups.useQuery();
    const { data: teachersData, isLoading: teachersLoading } = api.subject.getAvailableTeachers.useQuery();

    // Transform the data to match the Class interface
    const classes: Class[] = classesData?.map(c => ({
        id: c.id,
        name: c.name,
        capacity: c.capacity,
        status: c.status,
        classGroup: {
            id: c.classGroup.id,
            name: c.classGroup.name,
            program: {
                id: c.classGroup.program.id,
                name: c.classGroup.program.name || ''
            }
        },
        students: c.students.map(s => ({
            id: s.id,
            user: {
                name: s.userId || '',
                email: s.userId || undefined
            }
        })),
        teachers: c.teachers.map(t => ({
            teacher: {
                id: t.teacher.id,
                user: {
                    name: t.teacher.user?.name || '',
                    email: t.teacher.user?.email || undefined
                }
            },
            isClassTutor: t.isClassTeacher,
            subjects: []
        }))
    })) || [];

    const teachers = teachersData?.map(t => ({
        id: t.id,
        user: {
            name: t.user.name || ''
        }
    })) || [];

    useEffect(() => {
        if (selectedClassId) {
            const selectedClass = classes.find(c => c.id === selectedClassId);
            if (selectedClass) {
                setIsFormOpen(true);
            }
        }
    }, [selectedClassId, classes]);

    const handleEdit = (id: string) => {
        setIsFormOpen(false);
        setSelectedClassId(id);
    };

    const handleCreate = () => {
        setSelectedClassId(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setSelectedClassId(null);
    };

    if (classesLoading || groupsLoading || teachersLoading) {
        return <div>Loading...</div>;
    }

    const stats = {
        totalClasses: classes.length,
        activeClasses: classes.filter(c => c.status === 'ACTIVE').length,
        totalStudents: classes.reduce((acc, c) => acc + c.students.length, 0),
        totalTeachers: classes.reduce((acc, c) => acc + c.teachers.length, 0),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Class Management</h2>
                <Button onClick={handleCreate}>Create Class</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                        <LuBookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalClasses}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeClasses} active classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <LuUsers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all classes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                        <LuUserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTeachers}</div>
                        <p className="text-xs text-muted-foreground">
                            Subject teachers & tutors
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Class Groups</CardTitle>
                        <LuGraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{classGroupsData?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Available class groups
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="mb-6 space-y-4">
                        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                            <Input
                                placeholder="Search classes..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="md:w-[300px]"
                            />
                            <Select
                                value={filters.classGroupId || "ALL"}
                                onValueChange={(value) => setFilters({ ...filters, classGroupId: value === "ALL" ? undefined : value })}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by Class Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Class Groups</SelectItem>
                                    {classGroupsData?.map((group) => (
                                        <SelectItem key={group.id} value={group.id}>
                                            {group.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.teacherId || "ALL"}
                                onValueChange={(value) => setFilters({ ...filters, teacherId: value === "ALL" ? undefined : value })}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by Teacher" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Teachers</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status || "ALL"}
                                onValueChange={(value) => setFilters({ ...filters, status: value === "ALL" ? undefined : value as Status })}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    {Object.values(Status).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <ClassList 
                            classes={classes} 
                            onSelect={handleEdit}
                        />
                    </div>
                </CardContent>
            </Card>

            <ClassForm 
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                selectedClass={classes.find(c => c.id === selectedClassId)}
                classGroups={classGroupsData || []}
                teachers={teachers}
            />
        </div>
    );
};