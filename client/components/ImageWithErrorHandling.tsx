import type { ImageProps } from "next/image";
import Image from "next/image";
import { useState } from "react";

interface EnhancedImageProps extends ImageProps {
	maxTries?: number;
	fallbackSrc?: string;
}

export function ImageWithErrorHandling({
	maxTries = 3,
	fallbackSrc,
	...props
}: EnhancedImageProps) {
	const [loadTries, setLoadTries] = useState(0);
	const [showFallback, setShowFallback] = useState(false);

	const handleImageError = () => {
		if (loadTries >= maxTries - 1 && fallbackSrc) {
			setShowFallback(true);
		} else if (loadTries < maxTries) {
			setLoadTries(loadTries + 1);
		}
	};

	const imageProps = showFallback
		? { ...props, src: fallbackSrc }
		: { ...props, onError: handleImageError };

	return <Image key={loadTries} {...(imageProps as ImageProps)} />;
}
