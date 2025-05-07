import Image from "next/image";

interface OptimizedImageProps {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	className?: string;
	priority?: boolean;
}

export default function OptimizedImage({ src, alt, width, height, className, priority = false }: OptimizedImageProps) {
	return (
		<div className={`relative ${className}`}>
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				priority={priority}
				quality={85}
				loading={priority ? "eager" : "lazy"}
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				className="object-cover"
			/>
		</div>
	);
}
