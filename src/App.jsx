import React, { useState } from "react";

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
			{currentView === "viewer" && <PDFHighlighter />}
			{currentView === "notes" && (
				<NotesList setCurrentView={setCurrentView} />
			)}
		</div>
	);
}

export default App;
