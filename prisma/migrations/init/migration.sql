-- Create Status enum if it doesn't exist
DO $$ BEGIN
	CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

-- Create the academic_year_settings table
CREATE TABLE IF NOT EXISTS "academic_year_settings" (
	"id" TEXT NOT NULL,
	"startMonth" INTEGER NOT NULL,
	"startDay" INTEGER NOT NULL,
	"endMonth" INTEGER NOT NULL,
	"endDay" INTEGER NOT NULL,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "academic_year_settings_pkey" PRIMARY KEY ("id")
);

-- Create the academic_years table
CREATE TABLE IF NOT EXISTS "academic_years" (
	"id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"startDate" TIMESTAMP(3) NOT NULL,
	"endDate" TIMESTAMP(3) NOT NULL,
	"status" "Status" NOT NULL DEFAULT 'ACTIVE',
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,
	CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- Create a default academic year for existing calendars
INSERT INTO "academic_years" ("id", "name", "startDate", "endDate", "updatedAt")
SELECT 
	'default-academic-year',
	'2023-2024',
	MIN("startDate"),
	MAX("endDate"),
	CURRENT_TIMESTAMP
FROM "calendars"
ON CONFLICT DO NOTHING;

-- Add academicYearId column to calendars if it doesn't exist
DO $$ BEGIN
	ALTER TABLE "calendars" ADD COLUMN "academicYearId" TEXT;
EXCEPTION
	WHEN duplicate_column THEN null;
END $$;

-- Update existing calendars to use the default academic year
UPDATE "calendars"
SET "academicYearId" = 'default-academic-year'
WHERE "academicYearId" IS NULL;

-- Add foreign key constraint if it doesn't exist
DO $$ BEGIN
	ALTER TABLE "calendars"
	ADD CONSTRAINT "calendars_academicYearId_fkey"
	FOREIGN KEY ("academicYearId")
	REFERENCES "academic_years"("id");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;

-- Create unique constraint on academic year name if it doesn't exist
DO $$ BEGIN
	CREATE UNIQUE INDEX "academic_years_name_key" ON "academic_years"("name");
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;