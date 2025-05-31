import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	AreaHighlight,
	Highlight,
	PdfHighlighter,
	PdfLoader,
	Popup,
	Tip,
} from "react-pdf-highlighter";

import { Sidebar } from "./Sidebar";
import { Spinner } from "./Spinner";
import "react-pdf-highlighter/dist/style.css";
import "../styles/PDFHighlighter.css";

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
	document.location.hash.slice("#highlight-".length);

const resetHash = () => {
	document.location.hash = "";
};

const HighlightPopup = ({ comment }) =>
	comment.text ? (
		<div className="Highlight__popup">
			{comment.emoji} {comment.text}
		</div>
	) : null;

const PDFHighlighter = () => {
	const [url, setUrl] = useState(null);
	const [highlights, setHighlights] = useState([]);
	const [pdfError, setPdfError] = useState(null);

	const pdfHighlighterRef = useRef(null);

	const getHighlightById = useCallback((id) => {
		return highlights.find((highlight) => highlight.id === id);
	}, [highlights]);

	const scrollToHighlightFromHash = useCallback(() => {
		const hashId = parseIdFromHash();
		const highlight = getHighlightById(hashId);
		if (highlight && pdfHighlighterRef.current) {
            console.log("highlight", highlight);
            pdfHighlighterRef.current.scrollTo(highlight);
		}
	}, [getHighlightById]);

	useEffect(() => {
		window.addEventListener("hashchange", scrollToHighlightFromHash, false);
		return () => {
			window.removeEventListener(
				"hashchange",
				scrollToHighlightFromHash,
				false,
			);
		};
	}, [scrollToHighlightFromHash]);

	const resetHighlights = () => {
		setHighlights([]);
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (file && file.type === "application/pdf") {
			const fileUrl = URL.createObjectURL(file);
			setUrl(fileUrl);            
			setHighlights([]);
			setPdfError(null);
		}
	};

	const addHighlight = (highlight) => {
		setHighlights((prevHighlights) => [
			{ ...highlight, id: getNextId() },
			...prevHighlights,
		]);
	};

	const updateHighlight = (highlightId, position, content) => {
		setHighlights((prevHighlights) =>
			prevHighlights.map((h) => {
				const {
					id,
					position: originalPosition,
					content: originalContent,
					...rest
				} = h;
				return id === highlightId
					? {
							id,
							position: { ...originalPosition, ...position },
							content: { ...originalContent, ...content },
							...rest,
						}
					: h;
			}),
		);
	};

	const highlightTransform = (
		highlight,
		index,
		setTip,
		hideTip,
		viewportToScaled,
		screenshot,
		isScrolledTo,
	) => {
		const isTextHighlight = !highlight.content?.image;

		const component = isTextHighlight ? (
			<Highlight
				isScrolledTo={isScrolledTo}
				position={highlight.position}
				comment={highlight.comment}
			/>
		) : (
			<AreaHighlight
				isScrolledTo={isScrolledTo}
				highlight={highlight}
				onChange={(boundingRect) => {
					updateHighlight(
						highlight.id,
						{ boundingRect: viewportToScaled(boundingRect) },
						{ image: screenshot(boundingRect) },
					);
				}}
			/>
		);

		return (
			<Popup
				popupContent={<HighlightPopup {...highlight} />}
				onMouseOver={(popupContent) => setTip(highlight, () => popupContent)}
				onMouseOut={hideTip}
				key={index}
			>
				{component}
			</Popup>
		);
	};

	const onSelectionFinished = (
		position,
		content,
		hideTipAndSelection,
		transformSelection,
	) => (
		<Tip
			onOpen={transformSelection}
			onConfirm={(comment) => {
				addHighlight({ content, position, comment });
				hideTipAndSelection();
			}}
		/>
	);

	return (
		<div className="App" style={{ display: "flex", height: "100vh" }}>
			<Sidebar highlights={highlights} resetHighlights={resetHighlights} />
			<div
				style={{
					height: "100vh",
					width: "75vw",
					position: "relative",
				}}
			>
				{/* File Upload and Controls */}
				<div
					style={{
						position: "absolute",
						top: "10px",
						right: "10px",
						zIndex: 1000,
						display: "flex",
						gap: "10px",
						alignItems: "center",
					}}
				>
				</div>

				{pdfError ? (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
							textAlign: "center",
							padding: "20px",
						}}
					>
						<h3 style={{ color: "#dc3545", marginBottom: "16px" }}>
							Failed to load PDF
						</h3>
						<p style={{ marginBottom: "16px", color: "#666" }}>{pdfError}</p>
						<p style={{ marginBottom: "16px", color: "#666" }}>
							Try uploading a local PDF file or check your internet connection.
						</p>
						<button
							type="button"
							onClick={() => setPdfError(null)}
							className="cursor-pointer bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
						>
							Retry
						</button>
					</div>
				) : !url ? (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
							textAlign: "center",
							padding: "20px",
						}}
					>
						<h3 className="mb-3 text-black text-2xl font-bold">Welcome to PDF Highlighter</h3>
						<p className="mb-3 text-black">
							Please upload a PDF file to get started with highlighting and annotation.
						</p>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                            Upload PDF File
                        </label>
					</div>
				) : (
					<PdfLoader
						url={url}
						beforeLoad={<Spinner />}
						onError={(error) => {
							setPdfError(
								`Error loading PDF: ${error.message || "Unknown error"}`,
							);
						}}
					>
						{(pdfDocument) => {
							console.log("PDF Document loaded:", pdfDocument);
							return (
								<PdfHighlighter
									ref={pdfHighlighterRef}
									pdfDocument={pdfDocument}
									enableAreaSelection={(event) => event.altKey}
									onScrollChange={resetHash}
									onSelectionFinished={onSelectionFinished}
									highlightTransform={highlightTransform}
									highlights={highlights}
								/>
							);
						}}
					</PdfLoader>
				)}
			</div>
		</div>
	);
};

export default PDFHighlighter;
