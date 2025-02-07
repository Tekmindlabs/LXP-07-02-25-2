declare module 'pdfjs-dist' {
	const version: string;
	const GlobalWorkerOptions: {
		workerSrc: string;
	};
	function getDocument(data: ArrayBuffer | string): {
		promise: Promise<{
			numPages: number;
			getPage: (pageNumber: number) => Promise<{
				getTextContent: () => Promise<{
					items: Array<{ str: string }>;
				}>;
			}>;
		}>;
	};
}

