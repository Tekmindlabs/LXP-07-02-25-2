import { PrismaClient } from "@prisma/client";
import type { AcademicTerm, ClassGroupTermSettings } from "@/types/terms";

export class TermManagementService {
	private db: PrismaClient;

	constructor(db: PrismaClient) {
		this.db = db;
	}

	async createProgramTerms(programId: string, academicYearId: string, terms: Omit<AcademicTerm, 'id'>[]) {
		const programTerms = await this.db.programTermStructure.create({
			data: {
				program: { connect: { id: programId } },
				academicYear: { connect: { id: academicYearId } },
				academicTerms: {
					create: terms.map(term => ({
						name: term.name,
						startDate: term.startDate,
						endDate: term.endDate,
						type: term.type,
						calendarTerm: term.calendarTermId ? {
							connect: { id: term.calendarTermId }
						} : undefined,
						assessmentPeriods: {
							create: term.assessmentPeriods.map(ap => ({
								name: ap.name,
								startDate: ap.startDate,
								endDate: ap.endDate,
								weight: ap.weight
							}))
						}
					}))
				}
			},
			include: {
				academicTerms: {
					include: {
						assessmentPeriods: true,
						calendarTerm: true
					}
				}
			}
		});

		const classGroups = await this.db.classGroup.findMany({
			where: { programId }
		});

		await Promise.all(
			classGroups.map(group =>
				this.db.classGroupTermSettings.create({
					data: {
						classGroup: { connect: { id: group.id } },
						programTerm: { connect: { id: programTerms.id } }
					}
				})
			)
		);

		return programTerms;
	}

	async getClassGroupTerms(classGroupId: string) {
		const termSettings = await this.db.classGroupTermSettings.findFirst({
			where: { classGroupId },
			include: {
				programTerm: {
					include: {
						academicTerms: {
							include: {
								assessmentPeriods: true,
								calendarTerm: true
							}
						}
					}
				}
			}
		});

		if (!termSettings) {
			throw new Error("Term settings not found for class group");
		}

		const customSettings = termSettings.customSettings ? 
			JSON.parse(termSettings.customSettings as string) as ClassGroupTermSettings['customSettings'] : 
			undefined;

		return this.mergeTermSettings(
			termSettings.programTerm.academicTerms as unknown as AcademicTerm[],
			customSettings
		);
	}

	async customizeClassGroupTerm(
		classGroupId: string,
		termId: string,
		customSettings: NonNullable<ClassGroupTermSettings['customSettings']>
	) {
		return this.db.classGroupTermSettings.update({
			where: {
				id: termId,
				classGroupId
			},
			data: {
				customSettings: JSON.stringify({
					startDate: customSettings.startDate?.toISOString(),
					endDate: customSettings.endDate?.toISOString(),
					assessmentPeriods: customSettings.assessmentPeriods?.map(ap => ({
						...ap,
						startDate: ap.startDate.toISOString(),
						endDate: ap.endDate.toISOString()
					}))
				})
			}
		});
	}

	private mergeTermSettings(
		baseTerms: AcademicTerm[],
		customSettings?: ClassGroupTermSettings['customSettings']
	): AcademicTerm[] {
		if (!customSettings) return baseTerms;

		return baseTerms.map(term => ({
			...term,
			startDate: customSettings.startDate ? new Date(customSettings.startDate) : term.startDate,
			endDate: customSettings.endDate ? new Date(customSettings.endDate) : term.endDate,
			assessmentPeriods: customSettings.assessmentPeriods?.map(ap => ({
				...ap,
				startDate: new Date(ap.startDate),
				endDate: new Date(ap.endDate)
			})) || term.assessmentPeriods
		}));
	}
}