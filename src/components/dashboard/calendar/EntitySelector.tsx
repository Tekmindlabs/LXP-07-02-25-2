import { api } from '@/utils/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EntitySelectorProps {
	level: string;
	value: string | null;
	onChange: (value: string) => void;
}

export const EntitySelector = ({ level, value, onChange }: EntitySelectorProps) => {
	const { data: entities } = api.calendar.getEntitiesByLevel.useQuery({ level });

	return (
		<Select value={value || 'NO_SELECTION'} onValueChange={onChange}>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder={`Select ${level}`} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="NO_SELECTION">No Selection</SelectItem>
				{entities?.map((entity) => (
					<SelectItem key={entity.id} value={entity.id}>
						{entity.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};