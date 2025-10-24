import React, { useState } from "react"
import { ChevronDown, ChevronUp, Trash2, Edit3, Save, X } from "lucide-react"
import { CategoryCard } from "./CategoryCard"
import "./DayCard.css"

export const DayCard = ({ initialDate, initialCategories, onDelete, onAddCategory }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [isEdit, setIsEdit] = useState(false)
	const [date, setDate] = useState(initialDate)
	const [categories, setCategories] = useState(initialCategories)

	const dayTotal = categories.reduce(
		(sum, cat) => sum + cat.entries.reduce((catSum, entry) => catSum + Number(entry.amount), 0),
		0
	)

	const updateCategory = (index, updatedCat) => {
		const newCategories = [...categories]
		newCategories[index] = updatedCat
		setCategories(newCategories)
	}

	const addCategory = () => {
		const newCat = { name: "", color: "#ccc", entries: [{ description: "Új tétel", amount: 0 }] }
		setCategories([...categories, newCat])
	}

  const deleteCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index)
    setCategories(newCategories)
  }

  const addEntryToCategory = (index) => {
    const newCategories = [...categories]
    newCategories[index].entries.push({ description: "Új tétel", amount: 0 })
    setCategories(newCategories)
  }

	const handleEditClick = () => {
		if (!isOpen) setIsOpen(true)
		setIsEdit(true)
	}

	const handleToggleOpen = () => {
		setIsOpen(prev => {
			if (prev) setIsEdit(false)
			return !prev
		})
	}

	const handleSave = () => setIsEdit(false)
	const handleCancel = () => setIsEdit(false)

	return (
		<div className="day-card">
			<div className="day-header">
				<div className="day-info">
					{isEdit ? (
						<input type="date" value={date} onChange={e => setDate(e.target.value)} />
					) : (
						<strong>{date.replace(/-/g, ".") + "."}</strong>
					)}
					{!isOpen && (
						<div className="day-category-dots">
							{categories.map((cat, i) => (
								<span key={i} className="small-dot" style={{ backgroundColor: cat.color }} />
							))}
						</div>
					)}
				</div>

				<div className="day-actions-total">
					<div className="day-total">{dayTotal.toLocaleString()} Ft</div>
					{!isEdit && (
						<>
							<button onClick={handleEditClick}><Edit3 size={20} /></button>
							<button onClick={onDelete}><Trash2 size={20} /></button>
						</>
					)}
					{isEdit && (
						<>
							<button onClick={handleSave}><Save size={20} /></button>
							<button onClick={handleCancel}><X size={20} /></button>
						</>
					)}
					<button onClick={handleToggleOpen}>
						{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
					</button>
				</div>
			</div>

			{isOpen && (
				<div className="day-content">
					{categories.map((cat, i) => (
						<CategoryCard
            key={i}
            category={cat}
            isEditing={isEdit}
            onUpdateCategory={(updatedCat) => updateCategory(i, updatedCat)}
            onAddEntry={() => addEntryToCategory(i)}
            onDeleteCategory={() => deleteCategory(i)}
          />
					))}
					{isEdit && (
						<button className="add-category-btn" onClick={addCategory}>
							Új kategória hozzáadása
						</button>
					)}
				</div>
			)}
		</div>
	)
}