"use client";

import { useEffect, useRef } from "react";

const ThePage = () => {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;

		if (iframe) {
			iframe.src = "https://spread-xi.vercel.app/chatbot";
			iframe.classList.add("chat-frame");

			// Apply styles to iframe via inline styling (or alternatively with className and external CSS)
			iframe.style.position = "fixed";
			iframe.style.bottom = "50px";
			iframe.style.right = "50px";
			iframe.style.border = "none";

			// Message listener for resizing the iframe
			const handleMessage = (e: MessageEvent) => {
				if (e.origin !== "https://spread-xi.vercel.app") return;
				try {
					const dimensions = JSON.parse(e.data);
					iframe.width = dimensions.width;
					iframe.height = dimensions.height;

					// Send a postMessage back to the iframe
					iframe.contentWindow?.postMessage(
						"2e8e1751-c75f-4959-97bd-77fed2f6009e",
						"https://spread-xi.vercel.app/"
					);
				} catch (error) {
					console.error("Error parsing iframe message:", error);
				}
			};

			// Add event listener
			window.addEventListener("message", handleMessage);

			// Cleanup on component unmount
			return () => {
				window.removeEventListener("message", handleMessage);
			};
		}
	}, []);

	return (
		<div>
			<h1>ThePage</h1>
			{/* The iframe element is rendered here and controlled with ref */}
			<iframe ref={iframeRef} title="Chatbot" width="300" height="400" />
		</div>
	);
};

export default ThePage;
