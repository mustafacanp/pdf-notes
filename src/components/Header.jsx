import React from "react";
import { Book, List, Image, Layout } from "lucide-react";

const Header = ({
	currentView,
	setCurrentView,
	currentSidebar,
	setCurrentSidebar,
}) => {
	return (
		<nav className="bg-blue-600 text-white p-1 shadow-md">
			<div className="flex justify-between items-center px-2">
				<div className="flex justify-between items-center px-2">
					<Image
						size={20}
						className={`cursor-pointer ${currentSidebar === "thumbnail" ? "bg-white text-blue-700" : ""}`}
						onClick={() => setCurrentSidebar("thumbnail")}
					/>
					<Layout
						size={20}
						className={`cursor-pointer ${currentSidebar === "outline" ? "bg-white text-blue-700" : ""}`}
						onClick={() => setCurrentSidebar("outline")}
					/>
				</div>
				<button
					type="button"
					onClick={() => setCurrentView("viewer")}
					className="cursor-pointer text-xl font-bold hover:opacity-80"
				>
					PDF Notes
				</button>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setCurrentView("viewer")}
						className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded text-sm ${currentView === "viewer" ? "bg-blue-700" : "hover:bg-blue-700"}`}
					>
						<Book size={20} />
						<span>PDF Viewer</span>
					</button>
					<button
						type="button"
						onClick={() => setCurrentView("notes")}
						className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded text-sm ${currentView === "notes" ? "bg-blue-700" : "hover:bg-blue-700"}`}
					>
						<List size={20} />
						<span>Notes</span>
					</button>
				</div>
			</div>
		</nav>
	);
};

export default Header;
