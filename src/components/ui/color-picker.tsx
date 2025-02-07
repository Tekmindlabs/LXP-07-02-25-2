import { Input } from "./input";

interface ColorPickerProps {
	value: string;
	onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
	return (
		<div className="flex gap-2">
			<Input
				type="color"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="w-12 h-12 p-1"
			/>
			<Input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="flex-1"
			/>
		</div>
	);
}