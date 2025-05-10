import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { NOTES_STORAGE_KEY } from "../utils/constants";

const NotesList = ({ setCurrentView }) => {
	const [notesData, setNotesData] = useState(null);

	useEffect(() => {
		const savedData = localStorage.getItem(NOTES_STORAGE_KEY);
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				setNotesData(parsedData);
			} catch (e) {
				console.error("Error reading saved notes data:", e);
			}
		}
	}, []);

	useEffect(() => {
		if (notesData) {
			localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesData));
		}
	}, [notesData]);

	const renderBackButton = () => {
		return (
			<button
				type="button"
				onClick={() => setCurrentView("viewer")}
				className="cursor-pointer flex bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm"
			>
				Back to PDF Viewer
			</button>
		);
	};

	if (!notesData || notesData.length <= 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6 text-center">
				<h2 className="text-xl font-semibold mb-2">No notes found yet</h2>
				<p className="text-gray-600 mb-4">
					Return to the PDF viewer to start adding notes
				</p>
				<div className=" justify-items-center">{renderBackButton()}</div>
			</div>
		);
	}

	const handleRemoveNote = (fileId, pageNumber, noteIndex) => {
		setNotesData((prev) => {
			const notesData = prev.map((file) => {
				if (file.id !== fileId) return file;

				const updatedPageNotes = [...file.notes[pageNumber]];
				updatedPageNotes.splice(noteIndex, 1);

				const updatedNotes = {
					...file.notes,
					[pageNumber]: updatedPageNotes,
				};

				if (updatedPageNotes.length === 0) {
					delete updatedNotes[pageNumber];
				}

				return { ...file, notes: updatedNotes };
			});

			return notesData.filter((file) => Object.keys(file.notes).length > 0);
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold mb-2">Saved Notes</h2>

			{notesData.fileName && (
				<div className="mb-6 text-gray-600">
					<p>File: {notesData.fileName}</p>
				</div>
			)}

			<div className="p-6 space-y-8">
				{notesData.map((file) => (
					<div
						key={file.id}
						className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white"
					>
						{/* File Name */}
						<h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
							{file.fileName}
						</h2>

						{Object.entries(file.notes).map(([pageNumber, notes]) => (
							<div key={pageNumber} className="mb-5">
								{/* Page Number */}
								<div className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
									Page {pageNumber}
								</div>

								{/* Notes List */}
								<ul className="space-y-2 text-sm">
									{notes.map((note, index) => (
										<li
											key={`${index}-${note}`}
											className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-md border border-gray-200"
										>
											<span className="text-gray-700 break-words">{note}</span>
											<button
												type="button"
												onClick={() =>
													handleRemoveNote(file.id, pageNumber, index)
												}
												className="cursor-pointer text-red-500 hover:text-red-700 ml-4"
											>
												<X size={20} />
											</button>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				))}
			</div>

			<div className=" justify-items-center">{renderBackButton()}</div>
		</div>
	);
};

export default NotesList;
