import React, { useState } from "react";
import { SIDEBAR_WIDTH } from "./utils/constants";

import Header from "./components/Header";
import PDFViewer from "./components/PDFViewer";
import PDFHighlighter from "./components/PDFHighlighter";
import NotesList from "./components/NotesList";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./App.css";

function App() {
	const [currentView, setCurrentView] = useState("highlighter");
	const [currentSidebar, setCurrentSidebar] = useState("thumbnail");

	return (
		<div className="min-h-screen bg-gray-100">
			<Header
				currentView={currentView}
				setCurrentView={setCurrentView}
				currentSidebar={currentSidebar}
				setCurrentSidebar={setCurrentSidebar}
			/>
			<div
				className="container mr-0 p-2"
				style={{
					marginLeft: SIDEBAR_WIDTH,
					width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
				}}
			>
				{currentView === "viewer" && (
					<PDFViewer currentSidebar={currentSidebar} />
				)}
				{currentView === "highlighter" && <PDFHighlighter />}
				{currentView === "notes" && (
					<NotesList setCurrentView={setCurrentView} />
				)}
			</div>
		</div>
	);
}

export default App;
