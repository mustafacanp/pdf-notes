import React from "react";

const updateHash = (highlight) => {
	document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({ highlights, resetHighlights }) {
	return (
		<div className="sidebar" style={{ width: "25vw" }}>
			<div className="description" style={{ padding: "1rem" }}>
				<h2 style={{ marginBottom: "1rem" }}>Highlighter</h2>
				<p className="text-xs">
					To create area highlight hold ⌥ Option key (Alt), then click and drag.
				</p>
			</div>

			<ul className="sidebar__highlights">
				{highlights.map((highlight, i) => (
					<li
						key={`highlight-${i + 1}`}
						className="sidebar__highlight"
						onMouseDown={() => {
							updateHash(highlight);
						}}
					>
						<div>
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
