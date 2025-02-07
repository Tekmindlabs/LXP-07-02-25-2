import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType, AttendanceStatus } from "@prisma/client";
import { generatePassword } from "../../../utils/password";
import * as XLSX from 'xlsx';

interface StudentActivity {
	status: string;
	grade: number | null;
	activity: {
		classId: string;
		type: string;
		subjectId: string;
	};
}

interface Subject {
	id: string;
	name: string;
}

interface ExcelRow {
	Name: string;
	Email: string;
	DateOfBirth: string;
	ClassId?: string;
	ParentEmail?: string;
}

const studentDataSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	classId: z.string().optional(),
	parentEmail: z.string().email().optional(),
});

export const studentRouter = createTRPCRouter({
	createStudent: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			dateOfBirth: z.date(),
			classId: z.string(),
			parentName: z.string().optional(),
			parentEmail: z.string().email().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				// Check if student email exists
				const existingStudent = await ctx.prisma.user.findUnique({
					where: { email: input.email }
				});
				if (existingStudent) {
					throw new Error("Email already exists");
				}

				// Check if parent email exists if provided
				if (input.parentEmail) {
					const existingParent = await ctx.prisma.user.findUnique({
						where: { email: input.parentEmail }
					});
					if (existingParent) {
						throw new Error("Parent email already exists");
					}
				}

				const studentPassword = generatePassword();
				let parentData = null;
				
				// Create parent if parent info is provided
				if (input.parentName && input.parentEmail) {
					try {
						const parentPassword = generatePassword();
						const parent = await ctx.prisma.user.create({
							data: {
								name: input.parentName,
								email: input.parentEmail,
								password: parentPassword,
								userType: "PARENT",
								status: "ACTIVE",
								parentProfile: {
									create: {},
								},
								userRoles: {
									create: {
										role: {
											connectOrCreate: {
												where: { name: "PARENT" },
												create: { name: "PARENT" }
											}
										}
									}
								}
							},
							include: {
								parentProfile: true,
								userRoles: {
									include: {
										role: true
									}
								}
							},
						});
						
						parentData = {
							...parent,
							credentials: parentPassword
						};
					} catch (error) {
						if (error instanceof Error) {
							throw new Error(`Failed to create parent: ${error.message}`);
						}
						throw new Error("Failed to create parent");
					}
				}

				// Create student
				try {
					const student = await ctx.prisma.user.create({
						data: {
							name: input.name,
							email: input.email,
							password: studentPassword,
							userType: "STUDENT",
							status: "ACTIVE",
							studentProfile: {
								create: {
									dateOfBirth: input.dateOfBirth,
									classId: input.classId,
									...(parentData?.parentProfile && { parentId: parentData.parentProfile.id }),
								},
							},
							userRoles: {
								create: {
									role: {
										connectOrCreate: {
											where: { name: "STUDENT" },
											create: { name: "STUDENT" }
										}
									}
								}
							}
						},
						include: {
							studentProfile: true,
							userRoles: {
								include: {
									role: true
								}
							}
						},
					});

					return {
						...student,
						studentProfile: {
							...student.studentProfile,
							credentials: studentPassword,
						},
						userRoles: student.userRoles,
						parentProfile: parentData ? {
							...parentData.parentProfile,
							credentials: parentData.credentials,
							userRoles: parentData.userRoles
						} : null
					};
				} catch (error) {
					if (error instanceof Error) {
						throw new Error(`Failed to create student: ${error.message}`);
					}
					throw new Error("Failed to create student");
				}
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Failed to create student");
			}
		}),

	list: protectedProcedure
		.input(z.object({
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.studentProfile.findMany({
				where: {
					classId: input.classId
				},
				include: {
					user: true
				}
			});
		}),

	updateStudent: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string(),
			email: z.string().email().nullable(),
			dateOfBirth: z.date(),
			classId: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				if (input.email) {
					const existingStudent = await ctx.prisma.user.findFirst({
						where: { 
							email: input.email,
							id: { not: input.id }
						}
					});
					if (existingStudent) {
						throw new Error("Email already exists");
					}
				}

				const student = await ctx.prisma.user.update({
					where: { id: input.id },
					data: {
						name: input.name,
						email: input.email,
						studentProfile: {
							update: {
								dateOfBirth: input.dateOfBirth,
								classId: input.classId,
							},
						},
					},
					include: {
						studentProfile: {
							include: {
								class: {
									include: {
										classGroup: {
											include: {
												program: true,
											},
										},
									},
								},
								parent: {
									include: {
										user: true,
									},
								},
							},
						},
					},
				});

				if (!student.studentProfile) {
					throw new Error("Student profile not found");
				}

				return student;
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(`Failed to update student: ${error.message}`);
				}
				throw new Error("Failed to update student");
			}
		}),




	deleteStudent: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input },
			});
		}),

	getStudent: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.user.findUnique({
				where: { id: input },
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},


						},
					},
				},
			});
		}),

	searchStudents: protectedProcedure
		.input(z.object({
			search: z.string().optional(),
			classId: z.string().optional(),
			programId: z.string().optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { search, classId, programId, status } = input;

			const students = await ctx.prisma.user.findMany({
				where: {
					userType: UserType.STUDENT,
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ email: { contains: search, mode: 'insensitive' } },
						],
					}),
					studentProfile: {
						...(classId && { classId }),
						...(programId && {
							class: {
								classGroup: {
									programId,
								},
							},
						}),
					},
					...(status && { status }),
				},
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});

			return students.map(student => {
				if (!student.studentProfile) {
					throw new Error(`Student ${student.id} has no profile`);
				}
				
				return {
					id: student.id,
					name: student.name || '',
					email: student.email || '',
					status: student.status,
					studentProfile: {
						dateOfBirth: student.studentProfile.dateOfBirth,
						class: student.studentProfile.class ? {
							id: student.studentProfile.class.id,
							name: student.studentProfile.class.name,
							classGroup: {
								id: student.studentProfile.class.classGroup.id,
								name: student.studentProfile.class.classGroup.name,
								program: {
									id: student.studentProfile.class.classGroup.program.id,
									name: student.studentProfile.class.classGroup.program.name,
								},
							},
						} : null,
						parent: student.studentProfile.parent ? {
							user: {
								name: student.studentProfile.parent.user.name || '',
							},
						} : null,
					},
				};
			});
		}),


	assignToClass: protectedProcedure
		.input(z.object({
			studentId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.studentProfile.update({
				where: { userId: input.studentId },
				data: { classId: input.classId },
				include: {
					class: {
						include: {
							classGroup: {
								include: {
									program: true,
								},
							},
						},
					},
				},
			});
		}),

	getStudentProfile: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			const student = await ctx.prisma.user.findUnique({
				where: { id: input.id },
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},
						},
					},
				},
			});

			if (!student || !student.studentProfile) {
				throw new Error("Student profile not found");
			}

			return student;
		}),


	getStudentPerformance: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const student = await ctx.prisma.studentProfile.findUnique({
				where: { userId: input },
				include: {
					class: {
						include: {
							classGroup: {
								include: {
									subjects: true,
								},
							},
						},
					},
				},
			});

			if (!student) {
				throw new Error("Student not found");
			}

			// Get activities and attendance separately
			const activities = await ctx.prisma.activitySubmission.findMany({
				where: { studentId: input },
				include: {
					activity: true,
				},
			});

			const attendance = await ctx.prisma.attendance.findMany({
				where: { studentId: student.id },
			});

			const subjects = student.class?.classGroup?.subjects || [];

			// Activity performance
			const activityMetrics = {
				total: activities.length,
				completed: activities.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED').length,
				graded: activities.filter(a => a.status === 'GRADED').length,
				averageGrade: activities.reduce((acc, curr) => acc + (curr.obtainedMarks || 0), 0) / activities.length || 0,
			};

			// Attendance metrics
			const attendanceMetrics = {
				total: attendance.length,
				present: attendance.filter(a => a.status === AttendanceStatus.PRESENT).length,
				absent: attendance.filter(a => a.status === AttendanceStatus.ABSENT).length,
				late: attendance.filter(a => a.status === AttendanceStatus.LATE).length,
				excused: attendance.filter(a => a.status === AttendanceStatus.EXCUSED).length,
				attendanceRate: (attendance.filter(a => a.status === AttendanceStatus.PRESENT).length / attendance.length) * 100 || 0,
			};

			// Subject-wise performance
			const subjectPerformance = subjects.map((subject: Subject) => {
				const subjectActivities = activities.filter(a => 
					a.activity.subjectId === subject.id && 
					a.activity.type === 'CLASS_EXAM'
				);

				return {
					subject: subject.name,
					activities: subjectActivities.length,
					averageGrade: subjectActivities.reduce((acc, curr) => acc + (curr.obtainedMarks || 0), 0) / subjectActivities.length || 0,
				};
			});

			return {
				student,
				performance: {
					activities: activityMetrics,
					attendance: attendanceMetrics,
					subjects: subjectPerformance,
				},
			};
		}),

	createCredentials: protectedProcedure
		.input(z.object({
			studentId: z.string(),
			studentPassword: z.string().min(6),
			parentPassword: z.string().min(6).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { studentId, studentPassword, parentPassword } = input;
			
			const student = await ctx.prisma.user.findFirst({
				where: { 
					id: studentId,
					userType: UserType.STUDENT 
				},
				include: {
					studentProfile: {
						include: {
							parent: {
								include: {
									user: true
								}
							}
						}
					}
				}
			});

			if (!student) {
				throw new Error("Student not found");
			}

			// Update student password
			await ctx.prisma.user.update({
				where: { id: studentId },
				data: { password: studentPassword }
			});

			// Update parent password if provided and parent exists
			if (parentPassword && student.studentProfile?.parent?.user) {
				await ctx.prisma.user.update({
					where: { id: student.studentProfile.parent.user.id },
					data: { password: parentPassword }
				});
			}

			return student;
		}),

	bulkUpload: protectedProcedure
		.input(z.instanceof(FormData))
		.mutation(async ({ ctx, input }) => {
			const file = input.get("file") as File;
			if (!file) throw new Error("No file provided");

			const fileBuffer = await file.arrayBuffer();
			const workbook = XLSX.read(fileBuffer, { type: 'array' });
			const worksheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

			if (jsonData.length > 500) {
				throw new Error("Maximum 500 students allowed per upload");
			}

			const results = {
				successful: 0,
				failed: 0,
				errors: [] as string[],
			};

			for (const row of jsonData) {
				try {
					const data = studentDataSchema.parse({
						name: row.Name,
						email: row.Email,
						dateOfBirth: row.DateOfBirth,
						classId: row.ClassId,
						parentEmail: row.ParentEmail,
					});

					const studentPassword = generatePassword();
					let parentData = null;

					if (data.parentEmail) {
						const existingParent = await ctx.prisma.user.findUnique({
							where: { email: data.parentEmail },
							include: { parentProfile: true },
						});

						if (!existingParent) {
							const parentPassword = generatePassword();
							const parent = await ctx.prisma.user.create({
								data: {
									email: data.parentEmail,
									password: parentPassword,
									userType: UserType.PARENT,
									status: Status.ACTIVE,
									parentProfile: {
										create: {},
									},
								},
								include: { parentProfile: true },
							});
							parentData = parent.parentProfile;
						} else {
							parentData = existingParent.parentProfile;
						}
					}

					await ctx.prisma.user.create({
						data: {
							name: data.name,
							email: data.email,
							password: studentPassword,
							userType: UserType.STUDENT,
							status: Status.ACTIVE,
							studentProfile: {
								create: {
									dateOfBirth: new Date(data.dateOfBirth),
									classId: data.classId,
									parentId: parentData?.id,
								},
							},
						},
					});

					results.successful++;
				} catch (error) {
					results.failed++;
					if (error instanceof Error) {
						results.errors.push(`Row ${results.successful + results.failed}: ${error.message}`);
					}
				}
			}

			return results;
		}),
});