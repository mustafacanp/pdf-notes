import React from "react";
import { Book, List, Image, BookOpen } from "lucide-react";

const Header = ({ currentView, setCurrentView }) => {
	return (
		<nav className="bg-blue-600 text-white p-1 shadow-md">
			<div className="flex justify-between items-center px-2">
				<div className="flex justify-between items-center px-2">
					<button
						type="button"
						onClick={() => setCurrentView("viewer")}
						className="cursor-pointer text-xl font-bold hover:opacity-80"
					>
						PDF Notes
					</button>
				</div>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => setCurrentView("viewer")}
						className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded text-sm ${currentView === "viewer" ? "bg-white text-blue-700" : "hover:bg-blue-700"}`}
					>
						<Book size={20} />
						<span>PDF View</span>
					</button>
					<button
						type="button"
						onClick={() => setCurrentView("notes")}
						className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded text-sm ${currentView === "notes" ? "bg-white text-blue-700" : "hover:bg-blue-700"}`}
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
