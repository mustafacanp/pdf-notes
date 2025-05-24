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
import { testHighlights as _testHighlights } from "../assets/test-highlights";

import "react-pdf-highlighter/dist/style.css";
import "../styles/PDFHighlighter.css";

const testHighlights = _testHighlights;

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

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480";

const PDFHighlighter = () => {
	const searchParams = new URLSearchParams(document.location.search);
	const initialUrl = searchParams.get("url") || PRIMARY_PDF_URL;
	const [url, setUrl] = useState(initialUrl);
	const [highlights, setHighlights] = useState(
		testHighlights[initialUrl] ? [...testHighlights[initialUrl]] : [],
	);

	// eslint-disable-next-line no-unused-vars
	const scrollViewerTo = useRef((highlight) => {});

	const resetHighlights = () => {
		setHighlights([]);
	};

	const toggleDocument = () => {
		const newUrl =
			url === PRIMARY_PDF_URL ? SECONDARY_PDF_URL : PRIMARY_PDF_URL;
		setUrl(newUrl);
		setHighlights(testHighlights[newUrl] ? [...testHighlights[newUrl]] : []);
	};

	const scrollToHighlightFromHash = useCallback(() => {
		const highlight = getHighlightById(parseIdFromHash());
		if (highlight) {
			console.log(highlight);
			console.log(scrollViewerTo.current(highlight));
			scrollViewerTo.current(highlight);
		}
	}, []);

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

	const getHighlightById = (id) => {
		return highlights.find((highlight) => highlight.id === id);
	};

	const addHighlight = (highlight) => {
		console.log("Saving highlight", highlight);
		setHighlights((prevHighlights) => [
			{ ...highlight, id: getNextId() },
			...prevHighlights,
		]);
	};

	const updateHighlight = (highlightId, position, content) => {
		console.log("Updating highlight", highlightId, position, content);
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

	return (
		<div className="App" style={{ display: "flex", height: "100vh" }}>
			<Sidebar
				highlights={highlights}
				resetHighlights={resetHighlights}
				toggleDocument={toggleDocument}
			/>
			<div
				style={{
					height: "100vh",
					width: "75vw",
					position: "relative",
				}}
			>
				<PdfLoader url={url} beforeLoad={<Spinner />}>
					{(pdfDocument) => (
						<PdfHighlighter
							pdfDocument={pdfDocument}
							enableAreaSelection={(event) => event.altKey}
							onScrollChange={resetHash}
							scrollRef={(scrollTo) => {
								console.log("scrollRef assigned", scrollTo);
								scrollViewerTo.current = scrollTo;
								if (document.location.hash) {
									scrollToHighlightFromHash();
								}
							}}
							onSelectionFinished={(
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
							)}
							highlightTransform={(
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
										onMouseOver={(popupContent) =>
											setTip(highlight, () => popupContent)
										}
										onMouseOut={hideTip}
										key={index}
									>
										{component}
									</Popup>
								);
							}}
							highlights={highlights}
						/>
					)}
				</PdfLoader>
			</div>
		</div>
	);
};

export default PDFHighlighter;
