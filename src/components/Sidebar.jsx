import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const updateHash = (highlight) => {
	document.location.hash = `highlight-${highlight.id}`;
};

function isMac() {
	// Modern approach (limited browser support)
	if (navigator.userAgentData) {
		return navigator.userAgentData.platform.toLowerCase().includes("mac");
	}

	// Fallback to userAgent only
	return /mac|iphone|ipad|ipod|ios/i.test(navigator.userAgent);
}

export function Sidebar({
	highlights,
	resetHighlights,
	onDeleteHighlight,
	width = 400,
	onWidthChange,
}) {
	const [isResizing, setIsResizing] = useState(false);
	const sidebarRef = useRef(null);
	const keyName = isMac() ? "⌥ Option" : "Alt";

	useEffect(() => {
		const handleMouseMove = (e) => {
			if (!isResizing) return;

			const newWidth = e.clientX;
			const minWidth = 250;
			const maxWidth = window.innerWidth * 0.6; // Max 60% of window width

			if (newWidth >= minWidth && newWidth <= maxWidth) {
				onWidthChange?.(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizing, onWidthChange]);

	const handleMouseDown = (e) => {
		e.preventDefault();
		setIsResizing(true);
	};

	return (
		<div className="flex">
			<div
				ref={sidebarRef}
				className="sidebar border-r border-gray-300 bg-white overflow-y-auto"
				style={{ width: `${width}px`, minWidth: "250px", maxWidth: "60vw" }}
			>
				<div className="description" style={{ padding: "1rem" }}>
					<h2 className="text-lg font-bold-3 mb-3">Notes</h2>
					<p className="text-xs">
						Hold <b>{keyName}</b> key + drag to highlight an area.
					</p>
				</div>

				<ul className="sidebar__highlights">
					{highlights.map((highlight, i) => (
						<li
							key={`highlight-${i + 1}`}
							className="sidebar__highlight relative group"
							onMouseDown={() => {
								updateHash(highlight);
							}}
						>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<strong>{highlight.comment.text}</strong>
									{highlight.content.text ? (
										<blockquote style={{ marginTop: "0.5rem" }}>
											{`${highlight.content.text.slice(0, 90).trim()}…`}
										</blockquote>
									) : null}
									{highlight.content.image ? (
										<div
											className="highlight__image"
											style={{ marginTop: "0.5rem" }}
										>
											<img src={highlight.content.image} alt={"Screenshot"} />
										</div>
									) : null}
								</div>
								{onDeleteHighlight && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteHighlight(highlight.id);
										}}
										className="cursor-pointer text-red-500 hover:text-red-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
										title="Delete this highlight"
									>
										<X size={16} />
									</button>
								)}
							</div>
							<div className="highlight__location">
								Page {highlight.position.pageNumber}
							</div>
						</li>
					))}
				</ul>
				{highlights.length > 0 ? (
					<div className="flex justify-end p-4">
						<button
							type="button"
							className="cursor-pointer bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
							onClick={resetHighlights}
						>
							Reset highlights
						</button>
					</div>
				) : null}
			</div>

			{/* Resize Handle */}
			<div
				className="resize-handle bg-gray-200 hover:bg-gray-300 cursor-col-resize flex items-center justify-center transition-colors duration-150"
				style={{ width: "6px" }}
				onMouseDown={handleMouseDown}
				title="Drag to resize sidebar"
			>
				<div className="w-1 h-8 bg-gray-400 rounded-full opacity-60" />
			</div>
		</div>
	);
}
