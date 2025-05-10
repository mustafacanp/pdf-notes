import React, { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page, Thumbnail, Outline } from "react-pdf";
import InfiniteScroll from "react-infinite-scroll-component";
import {
	FileUp,
	Plus,
	Save,
	X,
	ChevronLeft,
	ChevronRight,
	ZoomOut,
	ZoomIn,
} from "lucide-react";
import { NOTES_STORAGE_KEY, SIDEBAR_WIDTH } from "../utils/constants";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url,
).toString();

const PDFViewer = ({ currentSidebar }) => {
	const [file, setFile] = useState(null);
	const [pdf, setPdf] = useState(null);
	const [fileName, setFileName] = useState(null);
	const [numPages, setNumPages] = useState(0);
	const [currentPageNumber, setCurrentPageNumber] = useState(0);
	const [visiblePages, setVisiblePages] = useState([]);
	const [scale, setScale] = useState(1);
	const [selectedText, setSelectedText] = useState("");
	const [notes, setNotes] = useState([]);
	const [currentNote, setCurrentNote] = useState("");
	const [showNotes, setShowNotes] = useState(false);
	const [showAddNote, setShowAddNote] = useState(false);
	const [buttonPos, setButtonPos] = useState(null);
	const fileInputRef = useRef(null);
	const containerRef = useRef(null);
	const textareaRef = useRef(null);

	useEffect(() => {
		const savedData = localStorage.getItem(NOTES_STORAGE_KEY);
		if (savedData) {
			try {
				const parsedData = JSON.parse(savedData);
				setNotes(parsedData || []);
			} catch (e) {
				console.error("Error reading saved notes data:", e);
			}
		}
	}, []);

	useEffect(() => {
		if (showAddNote && textareaRef.current) {
			const el = textareaRef.current;
			el.focus();
			el.setSelectionRange(el.value.length, el.value.length);
			el.scrollTop = el.scrollHeight;
		}
	}, [showAddNote]);

	useEffect(() => {
		if (numPages) {
			setVisiblePages(dynamicArrayFrom(1, 10));
		}
	}, [numPages]);

	const dynamicArrayFrom = (start, end) =>
		Array.from({ length: end - start }, (_, i) => start + i);

	useEffect(() => {
		const handleMouseUp = (e) => {
			if (!pdf) {
				return;
			}

			const selection = window.getSelection();
			const text = selection.toString().trim();
			if (e.target.id === "add-note-button" && text) {
				setShowAddNote(true);
				setCurrentNote(text);
				setButtonPos(null);
				return;
			}

			if (!text || text === selectedText) {
				// Hide button if nothing selected
				setSelectedText("");
				setButtonPos(null);
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			setSelectedText(text);
			setButtonPos({ x, y });
		};

		const container = containerRef.current;
		container?.addEventListener("mouseup", handleMouseUp);
		return () => container?.removeEventListener("mouseup", handleMouseUp);
	}, [selectedText, pdf]);

	const onDocumentLoadSuccess = (pdfDoc) => {
		setNumPages(pdfDoc.numPages);
		setPdf(pdfDoc);
	};

	const onFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setFile(file);
			setFileName(file.name);
			setCurrentPageNumber(1);
			setSelectedText("");
		}
	};

	const changePage = (offset) => {
		const newPageNumber = currentPageNumber + offset;
		if (newPageNumber >= 1 && newPageNumber <= numPages) {
			setCurrentPageNumber(newPageNumber);
			setSelectedText("");
		}
	};

	const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
	const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2.0));

	const hideAddNote = () => {
		setShowAddNote(false);
		setCurrentNote("");
	};

	const saveNote = () => {
		if (!pdf) {
			alert("PDF not loaded");
			return;
		}

		const noteValue = textareaRef.current?.value;
		if (!noteValue) {
			alert("Please enter a note");
			return;
		}

		addNote(noteValue);
		hideAddNote();
	};

	const addNote = (noteValue) => {
		setNotes((prevNotes) => {
			const pdfId = pdf.fingerprints[0];

			// Check if we already have notes for this PDF
			const existingNoteObj = prevNotes.find((noteObj) => noteObj.id === pdfId);

			let updatedNotes;

			if (existingNoteObj) {
				updatedNotes = prevNotes.map((noteObj) => {
					if (noteObj.id !== pdfId) return noteObj;

					const pageNotes = noteObj.notes[currentPageNumber] || [];
					const updatedPageNotes = [...pageNotes, noteValue];

					return {
						...noteObj,
						notes: {
							...noteObj.notes,
							[currentPageNumber]: updatedPageNotes,
						},
					};
				});
			} else {
				const newNoteObj = {
					id: pdfId,
					fileName: fileName,
					notes: {
						[currentPageNumber]: [noteValue],
					},
				};
				updatedNotes = [...prevNotes, newNoteObj];
			}

			localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
			return updatedNotes;
		});
	};

	const Header = () => {
		return (
			<div className="mb-1 flex flex-wrap gap-2 items-center">
				{fileName && (
					<span className="text-gray-600 ml-2 text-sm font-semibold">
						{fileName}
					</span>
				)}

				<div className="flex gap-2 items-center ml-auto">
					{pdf && (
						<>
							<button
								type="button"
								onClick={() => changePage(-1)}
								disabled={currentPageNumber <= 1}
								className="cursor-pointer flex items-center bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
							>
								<ChevronLeft size={16} />
							</button>
							<span className="text-sm">
								Page {currentPageNumber} of {numPages}
							</span>
							<button
								type="button"
								onClick={() => changePage(1)}
								disabled={currentPageNumber >= numPages}
								className="cursor-pointer flex items-center bg-gray-200 hover:bg-gray-300 p-1 rounded disabled:opacity-50"
							>
								<ChevronRight size={16} />
							</button>
							<div className="flex gap-2 items-center mx-5">
								<button
									type="button"
									onClick={zoomOut}
									className="cursor-pointer flex items-center bg-gray-200 hover:bg-gray-300 p-1 rounded"
								>
									<ZoomOut size={16} />
								</button>
								{Number((scale * 100).toFixed(2))}%
								<button
									type="button"
									onClick={zoomIn}
									className="cursor-pointer flex items-center bg-gray-200 hover:bg-gray-300 p-1 rounded"
								>
									<ZoomIn size={16} />
								</button>
							</div>
							{showNotes ? (
								<ChevronRight
									size={30}
									className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded"
									onClick={() => setShowNotes(false)}
								/>
							) : (
								<ChevronLeft
									size={30}
									className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded"
									onClick={() => setShowNotes(true)}
								/>
							)}
							<button
								type="button"
								className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded"
								onClick={() => setShowAddNote(true)}
							>
								<Plus size={16} />
							</button>
						</>
					)}
				</div>
			</div>
		);
	};

	const AddNote = () => {
		return (
			<div className="bg-white absolute top-0 right-0 z-2 rounded-lg shadow-sm shadow-gray-300 p-1.5">
				<div className="flex items-center justify-between mb-3 text-sm">
					<h2 className="mr-23">
						Add Note to{" "}
						<span className="font-bold">Page {currentPageNumber}</span>
					</h2>
					<button
						type="button"
						onClick={saveNote}
						disabled={!pdf}
						className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-1.5 py-1 rounded disabled:opacity-50"
					>
						<Save size={16} />
						Save
					</button>
					<button
						type="button"
						className="ml-2 cursor-pointer flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"
						onClick={hideAddNote}
					>
						<X size={16} />
					</button>
				</div>
				<textarea
					ref={textareaRef}
					defaultValue={currentNote}
					className="w-full h-20 min-h-12 p-2 border rounded focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:bg-gray-100 text-sm"
					placeholder="Add your notes for this page here..."
				/>
			</div>
		);
	};

	const currentPDF = notes.find((n) => n.id === pdf?.fingerprints[0]);
	const notesOnPage = currentPDF?.notes[currentPageNumber] || [];

	if (!file) {
		return (
			<>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="cursor-pointer flex gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-sm"
				>
					<FileUp size={20} />
					Upload PDF
				</button>
				<input
					type="file"
					ref={fileInputRef}
					onChange={onFileChange}
					accept="application/pdf"
					className="hidden"
				/>
			</>
		);
	}

	const renderThumbnail = () => {
		const loadMorePages = () => {
			const lastElement = visiblePages[visiblePages.length - 1];
			setVisiblePages((prevPages) => [
				...prevPages,
				...dynamicArrayFrom(lastElement + 1, lastElement + 11),
			]);
		};
		return (
			<div
				className="fixed bg-gray-200 left-0 flex flex-col items-center p-1 top-9 h-[calc(100vh-9*var(--spacing))] overflow-y-auto"
				style={{ width: SIDEBAR_WIDTH }}
				id="scroll-container"
			>
				<InfiniteScroll
					scrollableTarget="scroll-container"
					dataLength={visiblePages.length}
					next={loadMorePages}
					hasMore={visiblePages.length < numPages}
					loader={<div>Loading...</div>}
				>
					{visiblePages.map((page) => (
						<div
							key={`thumb-page-${page + 1}`}
							className={`flex items-center justify-center relative border-4 ${page === currentPageNumber ? "border-zinc-400" : "border-transparent"}`}
						>
							<Thumbnail
								pageNumber={page}
								height={170}
								onItemClick={({ pageNumber }) =>
									setCurrentPageNumber(pageNumber)
								}
							/>
							<div className="absolute bottom-0 right-0 text-xs bg-white ">
								{page}
							</div>
						</div>
					))}
				</InfiniteScroll>
			</div>
		);
	};

	const renderOutline = () => {
		if (!pdf) {
			return null;
		}
		return (
			<div
				style={{ width: SIDEBAR_WIDTH }}
				className="fixed text-xs bg-gray-200 left-0 flex flex-col items-center p-3 gap-5 top-9 h-[calc(100vh-9*var(--spacing))] overflow-y-auto"
			>
				<Outline
					pdf={pdf}
					onItemClick={({ pageNumber }) => setCurrentPageNumber(pageNumber)}
				/>
			</div>
		);
	};

	return (
		<div className="flex flex-col gap-4 relative">
			<div className="bg-white rounded-lg shadow-md p-1">
				<Header />

				{currentSidebar === "outline" && renderOutline()}

				<div className="flex flex-col md:flex-row gap-5 p-5 justify-center justify-items-center bg-gray-50 relative">
					<div ref={containerRef} className="relative">
						<Document
							file={file}
							onLoadSuccess={onDocumentLoadSuccess}
							className="flex flex-row"
						>
							{currentSidebar === "thumbnail" && renderThumbnail()}
							<Page pageNumber={currentPageNumber} scale={scale} />
						</Document>
						{/* Add Note Button */}
						{buttonPos && (
							<button
								id="add-note-button"
								type="button"
								style={{
									position: "absolute",
									top: buttonPos.y + 25,
									left: buttonPos.x + 5,
									zIndex: 10,
								}}
								className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-1 px-2 rounded-lg shadow-md transition-all duration-50 transform hover:scale-102"
							>
								Add Note
							</button>
						)}
					</div>

					{/* Notes */}
					{showNotes && (
						<div className={"w-[35vw] bg-blue-200 p-5 h-auto"}>
							<div className="p-3">
								{notesOnPage.length > 0 ? (
									<>
										<h2 className="font-bold mb-2">Notes:</h2>
										{notesOnPage.map((note, i) => (
											<li key={`${i}-${note}`}>{note}</li>
										))}
									</>
								) : (
									<div>No Notes</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
			{showAddNote && <AddNote key={`add-note-page-${currentPageNumber}`} />}
		</div>
	);
};

export default PDFViewer;
