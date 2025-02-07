import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const brandKitSchema = z.object({
	logo: z.object({
		main: z.string(),
		favicon: z.string(),
		darkMode: z.string().optional(),
	}),
	colors: z.object({
		primary: z.string(),
		secondary: z.string(),
		accent: z.string(),
		background: z.string(),
		text: z.string(),
	}),
	typography: z.object({
		headingFont: z.string(),
		bodyFont: z.string(),
		fontSize: z.object({
			base: z.string(),
			heading: z.string(),
		}),
	}),
	spacing: z.object({
		containerPadding: z.string(),
		elementSpacing: z.string(),
	}),
	borderRadius: z.string(),
});

const systemSettingsSchema = z.object({
	mfaEnabled: z.boolean(),
	emailNotifications: z.boolean(),
	autoBackup: z.boolean(),
	maintenanceMode: z.boolean(),
});

const instituteSettingsSchema = z.object({
	name: z.string(),
	address: z.string(),
	phone: z.string(),
	email: z.string().email(),
	website: z.string().url().optional().or(z.literal("")),
	timezone: z.enum(["UTC", "GMT", "EST", "PST"]),
	academicYearStart: z.string()
		.refine(str => !isNaN(Date.parse(str)), "Invalid date format")
		.transform(str => new Date(str)),
	academicYearEnd: z.string()
		.refine(str => !isNaN(Date.parse(str)), "Invalid date format")
		.transform(str => new Date(str)),
});

const brandingSettingsSchema = z.object({
	logo: z.string().optional(),
	primaryColor: z.string(),
	secondaryColor: z.string(),
	accentColor: z.string(),
	fontFamily: z.string(),
	customCss: z.string().optional(),
});

export const settingsRouter = createTRPCRouter({
	getSystemSettings: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.systemSettings.findFirst({
			where: { id: 1 },
		});
	}),

	updateSystemSettings: protectedProcedure
		.input(systemSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.systemSettings.upsert({
				where: { id: 1 },
				update: input,
				create: {
					...input,
					id: 1,
				},
			});
		}),

	getInstituteSettings: protectedProcedure.query(async ({ ctx }) => {
		const settings = await ctx.prisma.instituteSettings.findFirst({
			where: { id: 1 },
		});

		if (!settings) {
			const defaultSettings = {
				id: 1,
				name: "",
				address: "",
				phone: "",
				email: "",
				website: null,
				logo: null,
				timezone: "UTC",
				academicYearStart: new Date(),
				academicYearEnd: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// Create default settings
			return ctx.prisma.instituteSettings.create({
				data: defaultSettings,
			});
		}

		return settings;
	}),

	updateInstituteSettings: protectedProcedure
		.input(instituteSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const { website, ...rest } = input;
				return await ctx.prisma.instituteSettings.upsert({
					where: { id: 1 },
					update: {
						...rest,
						website: website || null,
					},
					create: {
						...rest,
						website: website || null,
						id: 1,
					},
				});
			} catch (error) {
				console.error('Error updating institute settings:', error);
				throw new Error("Failed to update institute settings. Please check your input values.");
			}
		}),

	getBrandingSettings: protectedProcedure.query(async ({ ctx }) => {
		return ctx.prisma.brandingSettings.findFirst({
			where: { id: 1 },
		});
	}),

	updateBrandingSettings: protectedProcedure
		.input(brandingSettingsSchema)
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.brandingSettings.upsert({
				where: { id: 1 },
				update: input,
				create: {
					...input,
					id: 1,
				},
			});
		}),

  getBrandKit: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.brandKit.findFirst({
      orderBy: { createdAt: 'desc' }
    });
  }),

  updateBrandKit: protectedProcedure
    .input(brandKitSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.brandKit.create({
        data: input,
      });
    }),
});