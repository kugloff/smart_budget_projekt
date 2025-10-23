import React, { useState } from "react";
import "./CategoryManagerModal.css";

export const CategoryManagerModal = ({ isOpen, onClose }) => {
	const [categories, setCategories] = useState([
		{ name: "Étel", color: "#FF6B6B" },
		{ name: "Közlekedés", color: "#4ECDC4" },
		{ name: "Szórakozás", color: "#FFD93D" },
	]);
	const [newCategory, setNewCategory] = useState({ name: "", color: "#cccccc" });

	const handleAddCategory = () => {
		if (!newCategory.name.trim()) return;
		setCategories([...categories, newCategory]);
		setNewCategory({ name: "", color: "#cccccc" });
	};

	const handleCategoryChange = (index, field, value) => {
		const updated = [...categories];
		updated[index][field] = value;
		setCategories(updated);
	};

	const handleDelete = (index) => {
		if (!window.confirm("Biztos törölni szeretnéd a kategóriát?")) return;
		const updated = categories.filter((_, i) => i !== index);
		setCategories(updated);
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={e => e.stopPropagation()}>
				<h2 className="modal-title">Kategóriák kezelése</h2>

				<div className="category-list">
					{categories.map((cat, i) => (
						<div key={i} className="category-row">
							<input type="color" value={cat.color} onChange={e => handleCategoryChange(i, "color", e.target.value)}/>
							<input type="text" value={cat.name} onChange={e => handleCategoryChange(i, "name", e.target.value)}/>
							<button className="delete-btn" onClick={() => handleDelete(i)}>Törlés</button>
						</div>
					))}
				</div>

				<div className="add-category-label">Új kategória hozzáadása</div>
				<div className="add-category">
					<input type="color" value={newCategory.color} onChange={e => setNewCategory({...newCategory,color:e.target.value})}/>
					<input type="text" placeholder="Új kategória neve" value={newCategory.name} onChange={e => setNewCategory({...newCategory,name:e.target.value})}/>
					<button className="add-btn" onClick={handleAddCategory}>Hozzáadás</button>
				</div>

				<div className="category-modal-buttons">
                    <button className="category-close-btn" onClick={onClose}>Bezárás</button>
                </div>
			</div>
		</div>
	);
};