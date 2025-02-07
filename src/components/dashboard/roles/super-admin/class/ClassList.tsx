'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Class } from "@/types/class";
import { useRouter } from "next/navigation";

interface ClassListProps {
    classes: Class[];
    onSelect: (id: string) => void;
}

export const ClassList = ({ classes, onSelect }: ClassListProps) => {
    const router = useRouter();

    const handleView = (classId: string) => {
        router.push(`/dashboard/super-admin/class/${classId}`);
    };

    return (
        <ScrollArea className="rounded-md border h-[600px]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead className="w-[200px]">Program</TableHead>
                            <TableHead className="w-[200px]">Class Group</TableHead>
                            <TableHead className="w-[100px] text-center">Capacity</TableHead>
                            <TableHead className="w-[100px] text-center">Students</TableHead>
                            <TableHead>Teachers</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((cls) => (
                            <TableRow key={cls.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">{cls.name}</TableCell>
                                <TableCell>{cls.classGroup.program.name}</TableCell>
                                <TableCell>{cls.classGroup.name}</TableCell>
                                <TableCell className="text-center">{cls.capacity}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline">
                                        {cls.students?.length || 0}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {cls.teachers.map((t, idx) => (
                                            <Badge 
                                                key={idx} 
                                                variant="secondary"
                                                className="whitespace-nowrap"
                                            >
                                                {t.teacher.user.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={cls.status === "ACTIVE" ? "default" : "secondary"}>
                                        {cls.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onSelect(cls.id)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleView(cls.id)}
                                        >
                                            View
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>

    );
};