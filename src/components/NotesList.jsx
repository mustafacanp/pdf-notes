import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { HIGHLIGHTS_STORAGE_KEY } from "../utils/constants";

const NotesList = ({ setCurrentView }) => {
	const [notesData, setNotesData] = useState(null);

	useEffect(() => {
		const savedData = localStorage.getItem(HIGHLIGHTS_STORAGE_KEY);
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				setNotesData(parsedData);
			} catch (e) {
				console.error("Error reading saved highlights data:", e);
			}
		}
	}, []);

	useEffect(() => {
		if (notesData) {
			localStorage.setItem(HIGHLIGHTS_STORAGE_KEY, JSON.stringify(notesData));
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

	// Helper function to group highlights by page number
	const groupHighlightsByPage = (highlights) => {
		return highlights.reduce((acc, highlight) => {
			const pageNumber = highlight.position.pageNumber;
			if (!acc[pageNumber]) {
				acc[pageNumber] = [];
			}
			acc[pageNumber].push(highlight);
			return acc;
		}, {});
	};

	// Check if there are any highlights with comments
	const hasAnyComments = notesData?.some(file => 
		file.highlights?.some(highlight => highlight.comment?.text)
	) || false;

	if (!notesData || notesData.length <= 0 || !hasAnyComments) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6 text-center">
				<h2 className="text-xl font-semibold mb-2">No notes found yet</h2>
				<p className="text-gray-600 mb-4">
					Return to the PDF viewer to start adding highlights with comments
				</p>
				<div className=" justify-items-center">{renderBackButton()}</div>
			</div>
		);
	}

	const handleRemoveHighlight = (fileId, highlightId) => {
		setNotesData((prev) => {
			const updatedData = prev.map((file) => {
				if (file.id !== fileId) return file;

				const updatedHighlights = file.highlights.filter(highlight => highlight.id !== highlightId);
				
				return { ...file, highlights: updatedHighlights };
			});

			return updatedData.filter((file) => file.highlights.length > 0);
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h2 className="text-2xl font-bold mb-2">Saved Highlights & Notes</h2>

			<div className="p-6 space-y-8">
				{notesData.map((file) => {
					// Only show highlights that have comments
					const highlightsWithComments = file.highlights?.filter(highlight => highlight.comment?.text) || [];
					
					if (highlightsWithComments.length === 0) return null;

					const groupedHighlights = groupHighlightsByPage(highlightsWithComments);

					return (
						<div
							key={file.id}
							className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white"
						>
							{/* File Name */}
							<h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
								{file.fileName}
							</h2>

							{Object.entries(groupedHighlights)
								.sort(([a], [b]) => parseInt(a) - parseInt(b))
								.map(([pageNumber, highlights]) => (
								<div key={pageNumber} className="mb-5">
									{/* Page Number */}
									<div className="inline-flex items-center bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full mb-2">
										Page {pageNumber}
									</div>

									{/* Highlights List */}
									<ul className="space-y-3 text-sm">
										{highlights.map((highlight) => (
											<li
												key={highlight.id}
												className="bg-gray-50 hover:bg-gray-100 p-4 rounded-md border border-gray-200"
											>
												<div className="space-y-2">
													{/* Highlighted Text */}
													<div className="bg-yellow-100 p-2 rounded text-gray-800 italic">
														"{highlight.content.text}"
													</div>
													
													{/* Comment */}
													<div className="flex justify-between items-start">
														<div className="flex items-center space-x-2">
															{highlight.comment.emoji && (
																<span className="text-lg">{highlight.comment.emoji}</span>
															)}
															<span className="text-gray-700 break-words">{highlight.comment.text}</span>
														</div>
														<button
															type="button"
															onClick={() => handleRemoveHighlight(file.id, highlight.id)}
															className="cursor-pointer text-red-500 hover:text-red-700 ml-4 flex-shrink-0"
														>
															<X size={20} />
														</button>
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					);
				})}
			</div>

			<div className=" justify-items-center">{renderBackButton()}</div>
		</div>
	);
};

export default NotesList;
