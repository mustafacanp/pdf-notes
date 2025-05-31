import React from "react";
import { X } from "lucide-react";

const updateHash = (highlight) => {
	document.location.hash = `highlight-${highlight.id}`;
};

function isMac() {
    // Modern approach (limited browser support)
    if (navigator.userAgentData) {
        return navigator.userAgentData.platform.toLowerCase().includes('mac');
    }
    
    // Fallback to userAgent only
    return /mac|iphone|ipad|ipod|ios/i.test(navigator.userAgent);
}

export function Sidebar({ highlights, resetHighlights, onDeleteHighlight }) {
	const keyName = isMac() ? '⌥ Option' : 'Alt';
	return (
		<div className="sidebar border-r border-gray-300" style={{ width: "30vw" }}>
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
	);
}
