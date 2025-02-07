import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType, type Prisma } from "@prisma/client";
import * as XLSX from 'xlsx';
import { generatePassword } from "../../../utils/password";

// Excel row data interface
interface ExcelRow {
	Name: string;
	Email: string;
	PhoneNumber: string;
	TeacherType: string;
	Specialization?: string;
	SubjectIds?: string;
	ClassIds?: string;
}

// Schema for teacher data validation
const teacherDataSchema = z.object({
	name: z.string(),
	email: z.string().email(),
	phoneNumber: z.string(),
	teacherType: z.enum(['CLASS', 'SUBJECT']),
	specialization: z.string().optional(),
	subjectIds: z.array(z.string()).optional(),
	classIds: z.array(z.string()).optional(),
});

// Define TeacherType enum since it's not in Prisma client
export enum TeacherType {
	CLASS = 'CLASS',
	SUBJECT = 'SUBJECT'
}




export const teacherRouter = createTRPCRouter({
	createTeacher: protectedProcedure
		.input(z.object({
		  name: z.string(),
		  email: z.string().email(),
		  phoneNumber: z.string(),
		  teacherType: z.nativeEnum(TeacherType),
		  specialization: z.string().optional(),
		  availability: z.string().optional(),
		  subjectIds: z.array(z.string()).optional(),
		  classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
		  const { subjectIds = [], classIds = [], specialization, availability, teacherType, ...userData } = input;

		  const createInput: Prisma.UserCreateInput = {
			...userData,
			userType: UserType.TEACHER,
			teacherProfile: {
			  create: {
				specialization,
				availability,
				teacherType,
				permissions: teacherType === TeacherType.CLASS
				  ? ["VIEW_CLASS", "MANAGE_ATTENDANCE", "MANAGE_STUDENTS", "VIEW_REPORTS"]
				  : ["VIEW_SUBJECT", "MANAGE_ATTENDANCE"],
				subjects: {
				  create: subjectIds.map(subjectId => ({
					subject: { connect: { id: subjectId } },
					status: Status.ACTIVE,
				  })),
				},
				classes: {
				  create: classIds.map(classId => ({
					class: { connect: { id: classId } },
					status: Status.ACTIVE,
					isClassTeacher: teacherType === TeacherType.CLASS,
				  })),
				},
			  },
			},
		  };

		  const user = await ctx.prisma.user.create({
			data: createInput,

				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
						},
					},
				},
			});

			return user;
		}),

	updateTeacher: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().optional(),
			email: z.string().email().optional(),
			phoneNumber: z.string().optional(),
			teacherType: z.nativeEnum(TeacherType).optional(),
			specialization: z.string().optional(),
			availability: z.string().optional(),
			subjectIds: z.array(z.string()).optional(),
			classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, subjectIds = [], classIds = [], teacherType, ...updateData } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: id },
				include: { user: true },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			if (teacherType) {
				await ctx.prisma.teacherProfile.update({
					where: { id: teacherProfile.id },
					data: {
						teacherType,
					},
				});
			}


			// Handle subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			// Handle class assignments
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherType === TeacherType.CLASS,
					})),
				});
			}

			const userUpdateData: Prisma.UserUpdateInput = {
				...(updateData.name && { name: updateData.name }),
				...(updateData.email && { email: updateData.email }),
				...(updateData.phoneNumber && { phoneNumber: updateData.phoneNumber }),
				teacherProfile: {
					update: {
						...(updateData.specialization && { specialization: updateData.specialization }),
						...(updateData.availability && { availability: updateData.availability }),
					},
				},
			};

			return ctx.prisma.user.update({
				where: { id },
				data: userUpdateData,
				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
						},
					},
				},
			});
		}),


	deleteTeacher: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input },
			});
		}),

	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const teacher = await ctx.prisma.user.findFirst({
				where: { 
					id: input,
					userType: UserType.TEACHER 
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
										},
									},
								},
							},
						},
					},
				},
			});

			if (!teacher) {
				throw new Error("Teacher not found");
			}

			return teacher;
		}),


	assignClasses: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			classIds: z.array(z.string()),
			subjectIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			const { teacherId, classIds, subjectIds } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: teacherId },
				select: {
					id: true,
					teacherType: true,
				},
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			// Clear existing assignments
			await ctx.prisma.teacherClass.deleteMany({
				where: { teacherId: teacherProfile.id },
			});
			await ctx.prisma.teacherSubject.deleteMany({
				where: { teacherId: teacherProfile.id },
			});

			// Create new class assignments
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherProfile.teacherType === 'CLASS',
					})),
				});
			}

			// Create new subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			return ctx.prisma.user.findUnique({
				where: { id: teacherId },
				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
						},
					},
				},
			});
		}),


	searchTeachers: protectedProcedure
		.input(z.object({
			classIds: z.array(z.string()).optional(),
			subjectIds: z.array(z.string()).optional(),
			search: z.string().optional()
		}))
		.query(async ({ ctx, input }) => {
			const { search, classIds, subjectIds } = input;

			const where: Prisma.UserWhereInput = {
				userType: UserType.TEACHER,
				...(search && {
					OR: [
						{ name: { contains: search, mode: 'insensitive' } },
						{ email: { contains: search, mode: 'insensitive' } },
						{
							teacherProfile: {
								specialization: { contains: search, mode: 'insensitive' },
							},
						},
					],
				}),
				AND: [
					...(subjectIds && subjectIds.length > 0
						? [{
								teacherProfile: {
									subjects: {
										some: {
											subjectId: { in: subjectIds }
										},
									},
								},
							}]
						: []),
					...(classIds && classIds.length > 0
						? [{
								teacherProfile: {
									classes: {
										some: {
											classId: { in: classIds }
										},
									},
								},
							}]
						: []),
				],
			};

			const teachers = await ctx.prisma.user.findMany({
				where,
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});

			return teachers.map(teacher => ({
				id: teacher.id,
				name: teacher.name,
				email: teacher.email,
				phoneNumber: teacher.phoneNumber,
				status: teacher.status,
				teacherProfile: teacher.teacherProfile ? {
					teacherType: teacher.teacherProfile.teacherType as TeacherType,
					specialization: teacher.teacherProfile.specialization,
					availability: teacher.teacherProfile.availability,
					permissions: teacher.teacherProfile.permissions,
					subjects: teacher.teacherProfile.subjects.map(s => ({
						subject: {
							id: s.subject.id,
							name: s.subject.name,
						},
						status: s.status,
					})),
					classes: teacher.teacherProfile.classes.map(c => ({
						class: {
							id: c.class.id,
							name: c.class.name,
							classGroup: {
								name: c.class.classGroup.name,
							},
						},
						status: c.status,
						isClassTeacher: c.isClassTeacher,
					})),
				} : null,
			}));
		}),

	createCredentials: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			password: z.string().min(6),
		}))
		.mutation(async ({ ctx, input }) => {
			const { teacherId, password } = input;
			
			const teacher = await ctx.prisma.user.findFirst({
				where: { 
					id: teacherId,
					userType: UserType.TEACHER 
				},
			});

			if (!teacher) {
				throw new Error("Teacher not found");
			}

			return ctx.prisma.user.update({
				where: { id: teacherId },
				data: {
					password: password, // Note: In production, ensure password is properly hashed
				},
			});
		}),  // end of createCredentials

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
				throw new Error("Maximum 500 teachers allowed per upload");
			}

			const results = {
				successful: 0,
				failed: 0,
				errors: [] as string[],
			};

			for (const row of jsonData) {
				try {
					const data = teacherDataSchema.parse({
						name: row.Name,
						email: row.Email,
						phoneNumber: row.PhoneNumber,
						teacherType: row.TeacherType as 'CLASS' | 'SUBJECT',
						specialization: row.Specialization,
						subjectIds: row.SubjectIds?.split(',').map(id => id.trim()),
						classIds: row.ClassIds?.split(',').map(id => id.trim()),
					});

					const password = generatePassword();

					await ctx.prisma.user.create({
						data: {
							...data,
							password,
							userType: UserType.TEACHER,
							status: Status.ACTIVE,
							teacherProfile: {
								create: {
									teacherType: data.teacherType,
									specialization: data.specialization,
									permissions: data.teacherType === TeacherType.CLASS
										? ["VIEW_CLASS", "MANAGE_ATTENDANCE", "MANAGE_STUDENTS", "VIEW_REPORTS"]
										: ["VIEW_SUBJECT", "MANAGE_ATTENDANCE"],
									subjects: data.subjectIds ? {
										create: data.subjectIds.map(subjectId => ({
											subject: { connect: { id: subjectId } },
											status: Status.ACTIVE,
										})),
									} : undefined,
									classes: data.classIds ? {
										create: data.classIds.map(classId => ({
											class: { connect: { id: classId } },
											status: Status.ACTIVE,
											isClassTeacher: data.teacherType === TeacherType.CLASS,
										})),
									} : undefined,
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
		})
});