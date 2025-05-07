import Link from "next/link";
import JsonLd from "./JsonLd";

interface Crumb {
	label: string;
	path: string;
}

interface BreadcrumbsProps {
	items: Crumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@id": `https://retro-pop-comics.com${item.path}`,
				name: item.label,
			},
		})),
	};

	return (
		<>
			<JsonLd data={structuredData} />
			<nav aria-label="Breadcrumb" className="py-2">
				<ol className="flex flex-wrap items-center gap-2">
					<li>
						<Link href="/" className="text-gray-500 hover:text-primary">
							Home
						</Link>
					</li>
					{items.map((item, index) => (
						<li key={item.path} className="flex items-center">
							<span className="mx-2 text-gray-400">/</span>
							{index === items.length - 1 ? (
								<span className="text-gray-900 dark:text-gray-100" aria-current="page">
									{item.label}
								</span>
							) : (
								<Link href={item.path} className="text-gray-500 hover:text-primary">
									{item.label}
								</Link>
							)}
						</li>
					))}
				</ol>
			</nav>
		</>
	);
}
