import { Box, FormControl, FormLabel, Slider, Input, FormHelperText } from "@mui/joy";
import type { ChangeEvent, ForwardRefRenderFunction } from "react";
import { forwardRef } from "react";

interface SyncedSliderInputProps {
	value: number;
	onChange: (value: number) => void;
	name?: string;
	min?: number;
	max?: number;
	label: string;
	helperText?: string;
}

const SyncedSliderInput: ForwardRefRenderFunction<HTMLInputElement, SyncedSliderInputProps> = (
	{ value, name, onChange, min = 1, max = 30, label, helperText, ...props },
	ref
) => {
	const handleSliderChange = (event: Event, newValue: number | number[]) => {
		onChange(newValue as number);
	};

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const inputValue = Math.min(max, Math.max(min, Number(event.target.value)));
		onChange(inputValue);
	};

	return (
		<Box>
			<FormControl>
				<FormLabel>{label}</FormLabel>
				<Box sx={{ display: "flex", gap: 2 }}>
					<Slider
						value={value}
						onChange={handleSliderChange}
						min={min}
						max={max}
						valueLabelDisplay="auto"
						tabIndex={-1}
						sx={{ flex: 1 }}
					/>
					<Input
						{...props}
						ref={ref}
						type="number"
						name={name}
						value={value}
						onChange={handleInputChange}
						sx={{ width: 64 }}
					/>
				</Box>
				{helperText && <FormHelperText>{helperText}</FormHelperText>}
			</FormControl>
		</Box>
	);
};

export default forwardRef(SyncedSliderInput);
