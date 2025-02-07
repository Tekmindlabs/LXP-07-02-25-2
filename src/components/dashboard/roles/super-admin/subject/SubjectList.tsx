import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/utils/api";
import { Subject, Status } from "@prisma/client";

interface SubjectListProps {
	subjects: (Subject & {
		classGroups: {
			name: string;
			program: {
				name: string;
			};
		}[];
		teachers: {
			teacher: {
				user: {
					name: string | null;
				};
			};
		}[];
	})[];
	onSelect: (id: string) => void;
}

export const SubjectList = ({ subjects, onSelect }: SubjectListProps) => {
	const utils = api.useContext();
	const deleteMutation = api.subject.deleteSubject.useMutation({
		onSuccess: () => {
			utils.subject.searchSubjects.invalidate();
		},
	});

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{subjects.map((subject) => (
				<Card key={subject.id}>
					<CardContent className="p-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold">{subject.name}</h3>
								<Badge>{subject.code}</Badge>
							</div>
							<p className="text-sm">{subject.description}</p>
							
							<div className="space-y-1">
								<p className="text-sm font-medium">Class Groups</p>
								<div className="flex flex-wrap gap-1">
									{subject.classGroups.map((group) => (
										<Badge key={group.name} variant="secondary">
											{group.name} ({group.program.name})
										</Badge>
									))}
								</div>
							</div>

							<div className="space-y-1">
								<p className="text-sm font-medium">Teachers</p>
								<div className="flex flex-wrap gap-1">
									{subject.teachers.map((t) => (
										<Badge key={t.teacher.user.name} variant="outline">
											{t.teacher.user.name}
										</Badge>
									))}
								</div>
							</div>

							<p className="text-sm">Status: {subject.status}</p>

							<div className="flex space-x-2 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onSelect(subject.id)}
								>
									Edit
								</Button>
								<Button
									variant="destructive"
									size="sm"
									onClick={() => deleteMutation.mutate(subject.id)}
								>
									Delete
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
};