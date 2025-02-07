'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkTeacherUpload } from "./BulkTeacherUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Status } from "@prisma/client";
import { api } from "@/utils/api";
import { TeacherList } from "./TeacherList";
import { Teacher } from "@/types/user";

interface Subject {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  classGroup: {
    name: string;
  };
}

interface SearchFilters {
  search: string;
  subjectId?: string;
  classId?: string;
  status?: Status | "ALL" | undefined;
}



export const TeacherManagement = ({ role }: { role: string }) => {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    subjectId: "ALL",
    classId: "ALL",
    status: undefined
  });


  // Process filters before making API calls
  const processedFilters = {
    search: filters.search,
    subjectId: filters.subjectId === "ALL" ? undefined : filters.subjectId,
    classId: filters.classId === "ALL" ? undefined : filters.classId,
    status: filters.status === "ALL" ? undefined : filters.status,
  };

  // API queries with proper typing
  const { data: apiTeachers, isLoading } = api.teacher.searchTeachers.useQuery(processedFilters);
  const teachers = apiTeachers as Teacher[] | undefined;
  const { data: subjects } = api.subject.searchSubjects.useQuery({});
  const { data: classes } = api.class.searchClasses.useQuery({});

  if (isLoading) {

    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Teacher Management</CardTitle>
          <div className="flex items-center gap-4">
          <BulkTeacherUpload />
          <Button onClick={() => router.push(`/dashboard/${role}/teacher/create`)}>
            Add Teacher
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex space-x-4">
              <Input
                placeholder="Search teachers..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="max-w-sm"
              />
              <Select
                value={filters.subjectId}
                onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Subjects</SelectItem>
                  {subjects?.map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.classId}
                onValueChange={(value) => setFilters({ ...filters, classId: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Classes</SelectItem>
                  {classes?.map((cls: Class) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value as Status })}
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

            <TeacherList
              teachers={teachers || []}
              onSelect={(id) => router.push(`/dashboard/super-admin/teacher/${id}`)}
              onEdit={(id) => router.push(`/dashboard/super-admin/teacher/${id}/edit`)}
            />

        </CardContent>
      </Card>
    </div>
  );
};

