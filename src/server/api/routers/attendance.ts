import { z } from "zod";
import { createTRPCRouter, permissionProtectedProcedure } from "../trpc";
import { AttendanceStatus } from "@prisma/client";
import { startOfDay, endOfDay, subDays, startOfWeek, format } from "date-fns";
import { TRPCError } from "@trpc/server";
import { Permissions } from "@/utils/permissions";
import type { AttendanceRecord, AttendanceStatsData, AttendanceDashboardData } from "@/types/attendance";

interface StudentAbsenceRecord {
    name: string;
    count: number;
}

// Cache implementation
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
interface CacheEntry<T> {
    data: AttendanceStatsData | AttendanceDashboardData;
    timestamp: number;
}
const statsCache = new Map<string, CacheEntry<any>>();

export const attendanceRouter = createTRPCRouter({
    getByDateAndClass: permissionProtectedProcedure(Permissions.ATTENDANCE_VIEW)
      .input(z.object({
        date: z.date(),
        classId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { date, classId } = input;
        return ctx.prisma.attendance.findMany({
          where: {
            date: {
              gte: startOfDay(date),
              lte: endOfDay(date),
            },
            student: {
              classId: classId
            }
          },
          include: {
            student: {
              include: {
                user: true
              }
            }
          },
        });
      }),
  
    batchSave: permissionProtectedProcedure(Permissions.ATTENDANCE_MANAGE)
      .input(z.object({
        records: z.array(z.object({
          studentId: z.string(),
          classId: z.string(),
          date: z.date(),
          status: z.nativeEnum(AttendanceStatus),
          notes: z.string().optional()
        }))
      }))
      .mutation(async ({ ctx, input }) => {
        const { records } = input;
        
        return ctx.prisma.$transaction(
          records.map(record =>
            ctx.prisma.attendance.upsert({
              where: {
                studentId_date: {
                  studentId: record.studentId,
                  date: record.date,
                }
              },
              update: {
                status: record.status,
                notes: record.notes,
                classId: record.classId,
              },
              create: {
                studentId: record.studentId,
                classId: record.classId,
                date: record.date,
                status: record.status,
                notes: record.notes,
              },
            })
          )
        );
      }),

getStats: permissionProtectedProcedure(Permissions.ATTENDANCE_VIEW)
    .query(async ({ ctx }) => {
    try {
        const cacheKey = `stats_${ctx.session.user.id}`;
        const cached = statsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        const today = new Date();
        const weekStart = startOfWeek(today);

        const [todayAttendance, weeklyAttendance, absentStudents, classAttendance] = await Promise.all([
            // Today's attendance stats
            ctx.prisma.attendance.findMany({
                where: {
                    date: {
                        gte: startOfDay(today),
                        lte: endOfDay(today)
                    }
                },
                select: {
                    status: true
                }
            }),
            // Weekly attendance
            ctx.prisma.attendance.findMany({
                where: {
                    date: {
                        gte: weekStart,
                        lte: today
                    }
                },
                select: {
                    status: true
                }
            }),
            // Most absent students
            ctx.prisma.attendance.findMany({
                where: {
                    status: AttendanceStatus.ABSENT,
                    date: {
                        gte: subDays(today, 30)
                    }
                },
                select: {
                    student: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }),
            // Class attendance
            ctx.prisma.attendance.findMany({
                where: {
                    date: today
                },
                select: {
                    status: true,
                    class: {
                        select: {
                            name: true
                        }
                    }
                }
            })

        ]);

        // Process class attendance
        const classStats = classAttendance.reduce((acc: Record<string, { total: number; present: number }>, record) => {
            const className = record.class.name;
            if (!acc[className]) {
                acc[className] = { total: 0, present: 0 };
            }
            acc[className].total++;
            if (record.status === AttendanceStatus.PRESENT) {
                acc[className].present++;
            }
            return acc;
        }, {} as Record<string, { total: number; present: number }>);

        const lowAttendanceClasses = Object.entries(classStats)
            .map(([name, stats]) => ({
                name,
                percentage: (stats.present / stats.total) * 100
            }))
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 3);

        const mostAbsentStudents = Object.entries(absentStudents.reduce((acc: Record<string, StudentAbsenceRecord>, curr) => {
            const studentId = curr.student.id;
            acc[studentId] = {
                name: curr.student.user.name ?? 'Unknown',
                count: (acc[studentId]?.count || 0) + 1
            };
            return acc;
        }, {}))
            .map(([, data]) => ({
                name: data.name,
                absences: data.count
            }))
            .sort((a, b) => b.absences - a.absences)
            .slice(0, 3);

        const result: AttendanceStatsData = {
            todayStats: {
                present: todayAttendance.filter((a: { status: AttendanceStatus }) => a.status === AttendanceStatus.PRESENT).length,
                absent: todayAttendance.filter((a: { status: AttendanceStatus }) => a.status === AttendanceStatus.ABSENT).length,
                total: todayAttendance.length
            },
            weeklyPercentage: weeklyAttendance.length > 0 
                ? (weeklyAttendance.filter((a: { status: AttendanceStatus }) => a.status === AttendanceStatus.PRESENT).length / weeklyAttendance.length) * 100 
                : 0,
            mostAbsentStudents,
            lowAttendanceClasses
        };

        statsCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        console.error('Failed to fetch attendance stats:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch attendance statistics'
        });
    }
}),

getDashboardData: permissionProtectedProcedure(Permissions.ATTENDANCE_VIEW)
    .query(async ({ ctx }) => {
    try {
        const cacheKey = `dashboard_${ctx.session.user.id}`;
        const cached = statsCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        const today = new Date();
        const lastWeek = subDays(today, 7);

        // Get attendance data with class information
        const attendanceData = await ctx.prisma.attendance.findMany({
            where: {
                date: {
                    gte: lastWeek,
                    lte: today
                }
            },
            include: {
                class: true,
                student: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        // Process attendance trend by date
        const attendanceByDate = attendanceData.reduce((acc: Record<string, { total: number; present: number }>, record) => {
            const dateKey = format(record.date, 'yyyy-MM-dd');
            if (!acc[dateKey]) {
                acc[dateKey] = { total: 0, present: 0 };
            }
            acc[dateKey].total++;
            if (record.status === AttendanceStatus.PRESENT) {
                acc[dateKey].present++;
            }
            return acc;
        }, {} as Record<string, { total: number; present: number }>);

        // Process attendance by class
        const attendanceByClass = attendanceData.reduce((acc: Record<string, { total: number; present: number; absent: number }>, record) => {
            const className = record.class.name;
            if (!acc[className]) {
                acc[className] = { total: 0, present: 0, absent: 0 };
            }
            acc[className].total++;
            if (record.status === AttendanceStatus.PRESENT) {
                acc[className].present++;
            } else if (record.status === AttendanceStatus.ABSENT) {
                acc[className].absent++;
            }
            return acc;
        }, {} as Record<string, { total: number; present: number; absent: number }>);

        const result: AttendanceDashboardData = {
            attendanceTrend: Object.entries(attendanceByDate).map(([date, stats]) => ({
                date,
                percentage: (stats.present / stats.total) * 100
            })),
            classAttendance: Object.entries(attendanceByClass).map(([className, stats]) => ({
                className,
                present: stats.present,
                absent: stats.absent,
                percentage: (stats.present / stats.total) * 100
            }))
        };

        statsCache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch dashboard data'
        });
    }
})


});