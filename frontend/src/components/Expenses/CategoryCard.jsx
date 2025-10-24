import React, { useState } from "react";
import { EntryItem } from "./EntryItem";
import { Trash2 } from "lucide-react";
import "./DayCard.css";

export const CategoryCard = ({ category, isEditing, onUpdateCategory, onAddEntry, onDeleteCategory }) => {
	const [editedCategory, setEditedCategory] = useState({ ...category });
	const categoryColors = { Étel:"#FF6B6B", Közlekedés:"#4ECDC4", Szórakozás:"#FFD93D", Számlák:"#1E90FF", Bevásárlás:"#9B59B6", Egyéb:"#CCC" };
	const availableCategories = Object.keys(categoryColors);
	const categoryTotal = editedCategory.entries.reduce((sum, entry)=>sum+Number(entry.amount),0);

	const handleCategoryChange = (value)=>{
		const finalValue = value || "Egyéb";
		const updated = {...editedCategory, name:finalValue, color:categoryColors[finalValue]};
		setEditedCategory(updated);
		onUpdateCategory(updated);
	};

	const handleEntryChange = (index, field, value)=>{
		const newEntries = [...editedCategory.entries];
		newEntries[index] = {...newEntries[index],[field]:field==="amount"?Number(value):value};
		const updated = {...editedCategory, entries:newEntries};
		setEditedCategory(updated);
		onUpdateCategory(updated);
	};

	return (
		<div className="category-card">
			<div className="category-header">
				<div className="category-left">
					<span className="color-dot" style={{backgroundColor:editedCategory.color}}></span>
					{isEditing ? (
						<select value={editedCategory.name} onChange={e=>handleCategoryChange(e.target.value)} className="category-select">
							<option value="">Válassz kategóriát</option>
							{availableCategories.map((cat,i)=><option key={i} value={cat}>{cat}</option>)}
						</select>
					) : (
						<span className="category-name">{editedCategory.name}</span>
					)}
				</div>
				<div style={{display:"flex", alignItems:"center", gap:"8px"}}>
					<span className="category-total">{categoryTotal.toLocaleString()} Ft</span>
					{isEditing && (
						<button className="delete-entry-btn" onClick={onDeleteCategory}>
							<Trash2 size={16}/>
						</button>
					)}
				</div>
			</div>
			<div className="category-entries">
				{editedCategory.entries.map((entry,i)=>(
					<EntryItem key={i} entry={entry} isEditing={isEditing} onEntryChange={(field,value)=>handleEntryChange(i,field,value)} onDelete={()=>{
						const newEntries = editedCategory.entries.filter((_,idx)=>idx!==i);
						const updated = {...editedCategory, entries:newEntries};
						setEditedCategory(updated);
						onUpdateCategory(updated);
					}}/>
				))}
				{isEditing && <button className="add-entry-btn" onClick={onAddEntry}>Új tétel hozzáadása</button>}
			</div>
		</div>
	);
};