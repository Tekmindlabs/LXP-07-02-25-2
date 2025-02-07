'use client';

import { useEffect, useState } from 'react';
import { Progress } from './progress';
import { usePathname, useSearchParams } from 'next/navigation';

export function LoadingBar() {
	const [progress, setProgress] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		let progressInterval: NodeJS.Timeout;

		const startLoading = () => {
			setIsLoading(true);
			setProgress(0);
			
			progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 90) return prev;
					return prev + 10;
				});
			}, 200);
		};

		const completeLoading = () => {
			setProgress(100);
			setTimeout(() => {
				setIsLoading(false);
				setProgress(0);
			}, 500);
			clearInterval(progressInterval);
		};

		startLoading();
		
		return () => {
			clearInterval(progressInterval);
			completeLoading();
		};
	}, [pathname, searchParams]);

	if (!isLoading) return null;

	return (
		<Progress 
			value={progress} 
			className="fixed top-0 left-0 right-0 z-50" 
		/>
	);
}