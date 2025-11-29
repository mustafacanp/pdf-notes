import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	AreaHighlight,
	Highlight,
	PdfHighlighter,
	PdfLoader,
	Popup,
	Tip,
} from "react-pdf-highlighter";

import { HIGHLIGHTS_STORAGE_KEY } from "../utils/constants";
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

const HighlightPopup = ({ comment }) => {
	// console.log("comment", comment);

	return comment.text ? (
		<div className="Highlight__popup">
			{comment.emoji} {comment.text}
		</div>
	) : null;
};

const PDFHighlighter = () => {
	const [url, setUrl] = useState(null);
	const [highlights, setHighlights] = useState([]);
	const [pdfError, setPdfError] = useState(null);
	const [pdfDocument, setPdfDocument] = useState(null);
	const [fileName, setFileName] = useState(null);
	const [sidebarWidth, setSidebarWidth] = useState(400);

	const containerRef = useRef(null);
	const pdfHighlighterRef = useRef(null);
	const highlightedElementRef = useRef(null);

	// Load sidebar width from localStorage on mount
	useEffect(() => {
		const savedWidth = localStorage.getItem("sidebarWidth");
		if (savedWidth) {
			const width = Number.parseInt(savedWidth);
			if (width >= 250 && width <= window.innerWidth * 0.6) {
				setSidebarWidth(width);
			}
		}
	}, []);

	// Save sidebar width to localStorage when it changes
	const handleSidebarWidthChange = (newWidth) => {
		setSidebarWidth(newWidth);
		localStorage.setItem("sidebarWidth", newWidth.toString());
	};

	// Load highlights from localStorage on component mount
	useEffect(() => {
		const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
		if (savedData) {
			try {
				JSON.parse(savedData);
				// We'll load highlights for the current PDF when it's loaded
			} catch (e) {
				console.error("Error reading saved highlights data:", e);
			}
		}
	}, []);

	// Load highlights for current PDF when PDF document changes
	useEffect(() => {
		if (pdfDocument) {
			const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
			if (savedData) {
				try {
					const parsedData = JSON.parse(savedData);
					const pdfId = pdfDocument.fingerprints[0];
					const currentPdfHighlights = parsedData.find(
						(item) => item.id === pdfId,
					);
					if (currentPdfHighlights?.highlights?.length > 0) {
						setTimeout(() => {
							// TODO: find a better way to do this, setTimeout is a hack to ensure the PDF highlighter is fully initialized
							setHighlights(currentPdfHighlights.highlights);
						}, 100);
					}
				} catch (e) {
					console.error("Error loading highlights for current PDF:", e);
					setHighlights([]);
				}
			}
		}
	}, [pdfDocument]);

	const getHighlightById = useCallback(
		(id) => {
			return highlights.find((highlight) => highlight.id === id);
		},
		[highlights],
	);

	const scrollToHighlightFromHash = useCallback(() => {
		const hashId = parseIdFromHash();
		const highlight = getHighlightById(hashId);
		if (highlight && pdfHighlighterRef.current) {
			pdfHighlighterRef.current.scrollTo(highlight);
			setTimeout(() => {
				// pdfHighlighterRef.current.viewer.container.scrollTop = pdfHighlighterRef.current.viewer.container.scrollTop - 300;
			}, 100);
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

	useEffect(() => {
		const handleContainerResize = (entries) => {
			for (const entry of entries) {
				console.log("Container resized:", {
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				});
				// You can add logic here to handle the resize
				// For example, notify the PDF highlighter about the size change
			}
		};

		const resizeObserver = new ResizeObserver(handleContainerResize);
		const currentContainer = containerRef.current;

		if (currentContainer) {
			resizeObserver.observe(currentContainer);
			console.log("ResizeObserver attached to container");
		}

		return () => {
			if (currentContainer) {
				resizeObserver.unobserve(currentContainer);
			}
			resizeObserver.disconnect();
		};
	}, []);

	const resetHighlights = () => {
		setHighlights([]);
		// Also clear from localStorage for current PDF
		if (pdfDocument) {
			const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
			if (savedData) {
				try {
					const parsedData = JSON.parse(savedData);
					const pdfId = pdfDocument.fingerprints[0];
					const updatedData = parsedData.filter((item) => item.id !== pdfId);
					localStorage.setItem(
						HIGHLIGHTS_STORAGE_KEY,
						JSON.stringify(updatedData),
					);
				} catch (e) {
					console.error("Error clearing highlights from localStorage:", e);
				}
			}
		}
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (file && file.type === "application/pdf") {
			const fileUrl = URL.createObjectURL(file);
			setUrl(fileUrl);
			setFileName(file.name);
			setHighlights([]);
			setPdfError(null);
			setPdfDocument(null);
		}
	};

	const saveHighlightToStorage = (newHighlight) => {
		if (!pdfDocument) return;

		const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
		let parsedData = [];

		if (savedData) {
			try {
				parsedData = JSON.parse(savedData);
			} catch (e) {
				console.error("Error parsing saved highlights data:", e);
				parsedData = [];
			}
		}

		const pdfId = pdfDocument.fingerprints[0];
		const existingPdfIndex = parsedData.findIndex((item) => item.id === pdfId);

		if (existingPdfIndex >= 0) {
			// Update existing PDF highlights
			parsedData[existingPdfIndex].highlights.push(newHighlight);
		} else {
			// Create new PDF entry
			parsedData.push({
				id: pdfId,
				fileName: fileName,
				highlights: [newHighlight],
			});
		}

		localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(parsedData));
	};

	const addHighlight = (highlight) => {
		const newHighlight = { ...highlight, id: getNextId() };
		setHighlights((prevHighlights) => [newHighlight, ...prevHighlights]);

		// Save to localStorage
		saveHighlightToStorage(newHighlight);
	};

	const updateHighlight = (highlightId, position, content) => {
		setHighlights((prevHighlights) => {
			const updatedHighlights = prevHighlights.map((h) => {
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
			});

			// Save updated highlights to localStorage
			if (pdfDocument) {
				const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
				if (savedData) {
					try {
						const parsedData = JSON.parse(savedData);
						const pdfId = pdfDocument.fingerprints[0];
						const existingPdfIndex = parsedData.findIndex(
							(item) => item.id === pdfId,
						);

						if (existingPdfIndex >= 0) {
							parsedData[existingPdfIndex].highlights = updatedHighlights;
							localStorage.setItem(
								HIGHLIGHTS_STORAGE_KEY,
								JSON.stringify(parsedData),
							);
						}
					} catch (e) {
						console.error("Error updating highlights in localStorage:", e);
					}
				}
			}

			return updatedHighlights;
		});
	};

	const deleteHighlight = (highlightId) => {
		setHighlights((prevHighlights) => {
			const updatedHighlights = prevHighlights.filter(
				(h) => h.id !== highlightId,
			);

			// Update localStorage
			if (pdfDocument) {
				const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
				if (savedData) {
					try {
						const parsedData = JSON.parse(savedData);
						const pdfId = pdfDocument.fingerprints[0];
						const existingPdfIndex = parsedData.findIndex(
							(item) => item.id === pdfId,
						);

						if (existingPdfIndex >= 0) {
							parsedData[existingPdfIndex].highlights = updatedHighlights;
							localStorage.setItem(
								HIGHLIGHTS_STORAGE_KEY,
								JSON.stringify(parsedData),
							);
						}
					} catch (e) {
						console.error("Error updating highlights in localStorage:", e);
					}
				}
			}

			return updatedHighlights;
		});
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
		const component = (
			<div ref={highlightedElementRef}>
				{isTextHighlight ? (
					<Highlight
						ref={highlightedElementRef}
						isScrolledTo={isScrolledTo}
						position={highlight.position}
						comment={highlight.comment}
					/>
				) : (
					<AreaHighlight
						ref={highlightedElementRef}
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
				)}
			</div>
		);

		let height = 0;
		if (highlightedElementRef?.current) {
			const rect = highlightedElementRef.current.getBoundingClientRect();
			height = rect.height;
		}
		console.log("height", height, highlightedElementRef?.current);

		return (
			<Popup
				popupContent={<HighlightPopup {...highlight} />}
				onMouseOver={(popupContent) => {
					console.log("mouse over", popupContent, component);
					const popupContentCopy = React.cloneElement(popupContent, {
						paddingY: 100,
					});
					return setTip(highlight, () => popupContentCopy);
				}}
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
	) => {
		return (
			<Tip
				onOpen={transformSelection}
				onConfirm={(comment) => {
					addHighlight({ content, position, comment });
					hideTipAndSelection();
				}}
			/>
		);
	};

	return (
		<div
			className="App"
			style={{ display: "flex", height: "calc(100vh - 36px)" }}
		>
			<Sidebar
				highlights={highlights}
				resetHighlights={resetHighlights}
				onDeleteHighlight={deleteHighlight}
				width={sidebarWidth}
				onWidthChange={handleSidebarWidthChange}
			/>
			<div
				ref={containerRef}
				className="w-full relative"
				style={{ width: `calc(100% - ${sidebarWidth + 6}px)` }}
			>
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
						<h3 className="mb-3 text-black text-2xl font-bold">
							Welcome to PDF Highlighter
						</h3>
						<p className="mb-3 text-black">
							Please upload a PDF file to get started with highlighting and
							annotation.
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
						{(pdfDoc) => {
							setPdfDocument(pdfDoc);
							return (
								<PdfHighlighter
									ref={pdfHighlighterRef}
									pdfDocument={pdfDoc}
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
