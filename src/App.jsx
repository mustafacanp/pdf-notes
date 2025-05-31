import React, { useState } from "react";
import { SIDEBAR_WIDTH } from "./utils/constants";

import Header from "./components/Header";
import PDFHighlighter from "./components/PDFHighlighter";
import NotesList from "./components/NotesList";

import "./App.css";

function App() {
	const [currentView, setCurrentView] = useState("viewer");
	return (
		<div className="min-h-screen bg-gray-100">
			<Header
				currentView={currentView}
				setCurrentView={setCurrentView}
			/>
			<div
				className="container mr-0 p-2"
				style={{
					marginLeft: SIDEBAR_WIDTH,
					width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
				}}
			>
				{currentView === "viewer" && <PDFHighlighter />}
				{currentView === "notes" && (
					<NotesList setCurrentView={setCurrentView} />
				)}
			</div>
		</div>
	);
}

export default App;
