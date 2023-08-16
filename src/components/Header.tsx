import { Option, Select, Sheet } from "@mui/joy";
import { useRouter } from "next/router";

export function plural(word: string, count: number, singular = "", plural = "s") {
	if (count === 1) {
		return "1 " + word;
	}

	if (singular === "") {
		return `${count} ${word + plural}`;
	}

	return `${count} ${word.replace(new RegExp(`${singular}$`), plural)}`;
}

export function Header({ directories }: { directories: { fullPath: string; id: string }[] }) {
	const {
		push,
		query: { id = "new" },
	} = useRouter();
	return (
		<Sheet
			sx={{
				position: "sticky",
				top: 0,
				zIndex: 10,
				py: 2,
				px: 4,
				display: "flex",
				gap: 2,
				alignItems: "center",
			}}
		>
			{plural("project", directories.length)}
			<Select
				value={id}
				size="sm"
				variant="plain"
				onChange={(_, value) => {
					push(value === "new" ? "/" : `/projects/${value}`);
				}}
			>
				<Option value="new">New Project</Option>
				{directories.map(directory => (
					<Option key={directory.id} value={directory.id}>
						{directory.id}
					</Option>
				))}
			</Select>
		</Sheet>
	);
}
