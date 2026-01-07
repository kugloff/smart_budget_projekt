import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, Edit2, Save, X, Plus, AlertTriangle } from "lucide-react";
import "./ExpensesPage.css";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ marginBottom: "15px", color: "#ef4444" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto" }} />
        </div>
        <h3 className="modal-title">{title}</h3>
        <p style={{ marginBottom: "20px", color: "#666" }}>{message}</p>
        <div className="modal-buttons" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button className="close-button" onClick={onClose}>Mégse</button>
          <button className="delete-button" onClick={onConfirm} style={{ backgroundColor: "#ef4444", color: "white", border: "none" }}>
            Törlés
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ExpensesPage() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [categoryNames, setCategoryNames] = useState([]);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, id: null, title: "", message: "" });

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/get_napi_koltesek");
      const rawData = await res.json();
      
      const currentLimit = rawData.havi_limit || 0;
      setMonthlyLimit(currentLimit);

      const sourceData = rawData.napok || {};
      
      let formattedDays = Object.entries(sourceData).map(([dateKey, categoriesObj]) => {
        const categoriesArray = Object.entries(categoriesObj).map(([catName, catData]) => ({
          id: catData.koltes_id,
          name: catName,
          color: catData.szin_kod,
          entries: Array.isArray(catData.koltesek) ? catData.koltesek.map(entry => ({
            id: entry.id,
            description: entry.leiras,
            amount: entry.osszeg
          })) : [],
          total: (catData.koltesek || []).reduce((sum, e) => sum + (e.osszeg || 0), 0)
        }));

        const dayTotal = categoriesArray.reduce((sum, cat) => sum + cat.total, 0);

        return {
          date: dateKey,
          total: dayTotal,
          categories: categoriesArray,
          isOverLimit: false
        };
      });

      formattedDays.sort((a, b) => new Date(a.date) - new Date(b.date));

      let runningTotal = 0;
      formattedDays = formattedDays.map(day => {
          runningTotal += day.total;
          if (currentLimit > 0 && runningTotal > currentLimit) {
              return { ...day, isOverLimit: true };
          }
          return day;
      });

      formattedDays.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setDays(formattedDays);

    } catch (err) {
      console.error("Hiba:", err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadCategoryNames = async () => {
      try {
          const res = await fetch("/api/get_kategoria_nevek");
          const data = await res.json();
          setCategoryNames(data);
      } catch (err) {
          console.error("Nem sikerült betölteni a kategóriákat", err);
      }
  };

  useEffect(() => {
    loadData(true);
    loadCategoryNames();
  }, []);

  const initiateDelete = (type, id, name) => {
    if (type === 'day') {
      setModalConfig({
        isOpen: true, type: 'day', id: id, title: "Nap törlése",
        message: `Biztosan törölni szeretnéd a(z) ${id} napot? Minden adat elvész!`
      });
    } else if (type === 'entry') {
      setModalConfig({
        isOpen: true, type: 'entry', id: id, title: "Tétel törlése",
        message: `Törlöd ezt a tételt: "${name}"?`
      });
    } else if (type === 'category') {
        setModalConfig({
            isOpen: true, type: 'category', id: id, title: "Kategória törlése",
            message: `Törlöd a(z) "${name}" kategóriát erről a napról? A tételek is törlődnek!`
          });
    }
  };

  const handleConfirmDelete = async () => {
    const { type, id } = modalConfig;
    let url = "";
    
    if (type === 'day') {
        url = "/api/delete_napi_koltes";
    } else if (type === 'category') {
        url = "/api/delete_koltesi_kategoria";
    } else if (type === 'entry') {
        url = "/api/delete_koltes";
    }

    if (!url) {
        setModalConfig({ ...modalConfig, isOpen: false });
        return;
    }

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
      });
      
      if (res.ok) {
        await loadData(false); 
      } else {
        const err = await res.json();
        alert(err.info || "Hiba történt a törlés során!");
      }
    } catch (err) {
      console.error("Hiba:", err);
      alert("Hálózati hiba!");
    } finally {
      setModalConfig({ ...modalConfig, isOpen: false });
    }
  };

  return (
    <div className="expenses-view-container">
      <div className="expenses-container">
        <div style={{ marginBottom: "20px", padding: "16px", background: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
           <h2 style={{margin: 0, color: "#1e3a8a"}}>Havi keret: {monthlyLimit.toLocaleString()} Ft</h2>
        </div>

        {loading ? <p>Betöltés...</p> : (
          <div>
            {days.length === 0 ? <p>Nincs adat.</p> : days.map((day) => (
              <DayCard 
                key={day.date} 
                day={day} 
                categoryNames={categoryNames}
                onDelete={() => initiateDelete('day', day.date)}
                onDeleteEntry={initiateDelete} 
                onDeleteCategory={initiateDelete}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
}

const DayCard = ({ day, categoryNames, onDelete, onDeleteEntry, onDeleteCategory, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [localCategories, setLocalCategories] = useState([]);

  useEffect(() => {
    setLocalCategories(day.categories);
  }, [day.categories]);

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsOpen(true);
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const promises = [];

    for (const cat of localCategories) {
      for (const entry of cat.entries) {
        const hasContent = (entry.description && entry.description.trim() !== "") || (entry.amount && Number(entry.amount) > 0);
        
        if (!entry.id || entry.id.toString().startsWith('temp')) {
          if (hasContent) {
            promises.push(
              fetch("/api/add_koltes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  koltes_id: cat.id,
                  leiras: entry.description,
                  osszeg: Number(entry.amount)
                })
              })
            );
          }
        } 
        else {
          promises.push(
            fetch("/api/edit_koltes", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: entry.id,
                leiras: entry.description,
                osszeg: Number(entry.amount)
              })
            })
          );
        }
      }
    }

    try {
      const results = await Promise.all(promises);
      const allOk = results.every(r => r.ok);
      
      if (allOk) {
        setIsEditing(false);
        await onRefresh(false);
      } else {
        alert("Néhány tételt nem sikerült menteni!");
      }
    } catch (error) {
      console.error("Hiba a mentésnél:", error);
      alert("Hálózati hiba történt a mentéskor.");
    }
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setLocalCategories(day.categories);
    setIsEditing(false);
  };

  const handleEntryChange = (catIndex, entryIndex, field, value) => {
    const newCats = [...localCategories];
    newCats[catIndex].entries[entryIndex][field] = value;
    setLocalCategories(newCats);
  };

  const handleAddEntry = (catIndex) => {
    const newCats = [...localCategories];
    newCats[catIndex].entries.push({ 
        id: `temp-${Date.now()}`, 
        description: "", 
        amount: "" 
    });
    setLocalCategories(newCats);
  };

  const handleAddCategory = async (kategoria_nev_id) => {
      try {
        const res = await fetch("/api/add_koltesi_kategoria", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ datum: day.date, kategoria_id: kategoria_nev_id })
        });
        const result = await res.json();
        
        if (!result.error) {
            // MÓDOSÍTVA: false paraméter, hogy ne záródjon be
            await onRefresh(false); 
        } else {
            alert(result.info);
        }
      } catch (e) { console.error(e); }
  };

  return (
    <div className={`day-card ${isEditing ? 'editing-mode' : ''} ${day.isOverLimit ? 'over-limit' : ''}`}>
      <div className="day-header">
        <div className="day-info" onClick={() => setIsOpen(!isOpen)} style={{cursor: "pointer", flex: 1}}>
          <strong>{day.date?.replace(/-/g, ".") + "."}</strong>
          
          <div className="day-category-dots">
            {day.categories.map((cat, i) => {
               const dotColor = cat.color && cat.color.startsWith('#') ? cat.color : `#${cat.color || 'ccc'}`;
               return (
                 <span
                   key={i}
                   className="small-dot"
                   style={{ backgroundColor: dotColor }}
                   title={`${cat.name}: ${cat.total.toLocaleString()} Ft`}
                 />
               );
            })}
          </div>
        </div>

        <div className="day-actions-total">
          <div className="day-total">
            {day.total.toLocaleString()} Ft
          </div>
          
          {isEditing ? (
            <>
                <button className="icon-btn" onClick={handleSave} title="Mentés">
                    <Save size={20} color="#16a34a" />
                </button>
                <button className="icon-btn" onClick={handleCancel} title="Mégse">
                    <X size={20} color="#dc2626" />
                </button>
            </>
          ) : (
            <>
                <button className="icon-btn" onClick={handleStartEdit} title="Szerkesztés">
                    <Edit2 size={18} />
                </button>
                <button className="icon-btn" onClick={onDelete} title="Nap törlése">
                    <Trash2 size={18} />
                </button>
                <button className="icon-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="day-content">
          {localCategories.map((cat, catIndex) => (
            <CategoryCard 
                key={cat.id || catIndex} 
                category={cat} 
                isEditing={isEditing}
                onEntryChange={(entryIndex, field, val) => handleEntryChange(catIndex, entryIndex, field, val)}
                onAddEntry={() => handleAddEntry(catIndex)}
                onDeleteEntry={onDeleteEntry}
                onDeleteCategory={() => onDeleteCategory('category', cat.id, cat.name)}
            />
          ))}

          {isEditing && (
             <div className="add-category-section" style={{marginTop: "10px", textAlign: "center"}}>
                 <select 
                    className="category-select" 
                    onChange={(e) => handleAddCategory(e.target.value)}
                    value=""
                    style={{width: "100%", padding: "8px"}}
                 >
                     <option value="" disabled>+ Új kategória hozzáadása...</option>
                     {categoryNames.map(cn => (
                         <option key={cn[0]} value={cn[0]}>{cn[1]}</option>
                     ))}
                 </select>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, isEditing, onEntryChange, onAddEntry, onDeleteEntry, onDeleteCategory }) => {
  const color = category.color && category.color.startsWith('#') ? category.color : `#${category.color || 'ccc'}`;

  return (
    <div className="category-card" style={{borderColor: color}}>
      <div className="category-header">
        <div className="category-left">
          <span className="color-dot" style={{ backgroundColor: color }}></span>
          <span className="category-name">{category.name}</span>
        </div>
        
        <div style={{display: "flex", alignItems: "center"}}>
            <div className="category-total" style={{marginRight: isEditing ? "10px" : "0"}}>
                {category.total.toLocaleString()} Ft
            </div>
            {isEditing && (
                <button className="icon-btn" onClick={onDeleteCategory} title="Kategória törlése" style={{color: "#dc2626"}}>
                    <Trash2 size={16} />
                </button>
            )}
        </div>
      </div>

      <div className="category-entries">
        {category.entries.length === 0 && !isEditing && <small style={{color: "#888", fontStyle: "italic"}}>Nincsenek tételek</small>}
        
        {category.entries.map((entry, entryIndex) => (
          <EntryRow 
            key={entry.id || entryIndex} 
            entry={entry} 
            isEditing={isEditing}
            onChange={(field, val) => onEntryChange(entryIndex, field, val)}
            onDelete={() => onDeleteEntry('entry', entry.id, entry.description)}
          />
        ))}

        {isEditing && (
            <button className="add-entry-btn" onClick={onAddEntry} style={{width: "100%"}}>
                <Plus size={14} /> Új tétel
            </button>
        )}
      </div>
    </div>
  );
};

const EntryRow = ({ entry, isEditing, onChange, onDelete }) => {
  if (isEditing) {
      return (
        <div className="entry-item-container" style={{backgroundColor: "#fff"}}>
            <input 
                type="text" 
                className="entry-description-input"
                placeholder="Tétel neve"
                value={entry.description} 
                onChange={(e) => onChange('description', e.target.value)} 
            />
            <input 
                type="number" 
                className="entry-amount-input"
                placeholder="0"
                value={entry.amount} 
                onChange={(e) => onChange('amount', e.target.value)} 
            />
            <button className="delete-entry-btn" onClick={onDelete} title="Törlés">
                <Trash2 size={16} color="#dc2626"/>
            </button>
        </div>
      );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9em", padding: "4px 0", borderBottom: "1px solid #eee" }}>
      <span>{entry.description || "Nincs leírás"}</span>
      <span style={{ fontWeight: 600 }}>{Number(entry.amount).toLocaleString()} Ft</span>
    </div>
  );
};