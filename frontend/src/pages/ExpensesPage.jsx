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
    if (showLoading) setLoading(true);
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

        return {
          date: dateKey,
          total: categoriesArray.reduce((sum, cat) => sum + cat.total, 0),
          categories: categoriesArray,
          isOverLimit: false
        };
      });

      const monthlyTotals = {};
      formattedDays.forEach(day => {
        const monthKey = day.date.substring(0, 7);
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + day.total;
      });

      formattedDays = formattedDays.map(day => {
        const monthKey = day.date.substring(0, 7);
        const monthTotal = monthlyTotals[monthKey];
        return {
          ...day,
          isOverLimit: currentLimit > 0 && monthTotal > currentLimit
        };
      });

      formattedDays.sort((a, b) => new Date(b.date) - new Date(a.date));
      setDays(formattedDays);

    } catch (err) {
      console.error("Hiba az adatok betöltésekor:", err);
    } finally {
      if (showLoading) setLoading(false);
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

  const fetchLimit = async () => {
    try {
      const res = await fetch("/api/get_user_limit");
      const data = await res.json();
      if (data.limit !== undefined) setMonthlyLimit(data.limit);
    } catch (err) {
      console.error("Hiba a limit betöltésekor:", err);
    }
  };

  useEffect(() => {
    loadData(true);
    loadCategoryNames();
    fetchLimit();
  }, []);

  const initiateDelete = (type, id, name) => {
    setModalConfig({
      isOpen: true,
      type: type,
      id: id,
      title: type === 'day' ? "Nap törlése" : type === 'entry' ? "Tétel törlése" : "Kategória törlése",
      message: type === 'day' ? `Törlöd a(z) ${id} napot?` : `Törlöd: "${name}"?`
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = modalConfig;
    const urls = { day: "/api/delete_napi_koltes", category: "/api/delete_koltesi_kategoria", entry: "/api/delete_koltes" };
    
    try {
      const res = await fetch(urls[type], {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id })
      });
      if (res.ok) await loadData(false);
    } catch (err) {
      console.error("Hiba:", err);
    } finally {
      setModalConfig({ ...modalConfig, isOpen: false });
    }
  };

  return (
    <div className="expenses-view-container">
      <div className="expenses-container">
        <div style={{ marginBottom: "20px", padding: "16px", background: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
           <h2 style={{margin: 0, color: "#1e3a8a"}}>Havi költési limit: {monthlyLimit.toLocaleString()} Ft</h2>
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

  const handleSave = async (e) => {
    e.stopPropagation();
    const promises = [];
    localCategories.forEach(cat => {
      cat.entries.forEach(entry => {
        const hasContent = (entry.description?.trim() !== "") || (Number(entry.amount) > 0);
        if (!entry.id || entry.id.toString().startsWith('temp')) {
          if (hasContent) {
            promises.push(fetch("/api/add_koltes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ koltes_id: cat.id, leiras: entry.description, osszeg: Number(entry.amount) })
            }));
          }
        } else {
          promises.push(fetch("/api/edit_koltes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: entry.id, leiras: entry.description, osszeg: Number(entry.amount) })
          }));
        }
      });
    });

    try {
      await Promise.all(promises);
      setIsEditing(false);
      await onRefresh(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className={`day-card ${isEditing ? 'editing-mode' : ''} ${day.isOverLimit ? 'over-limit' : ''}`}>
      <div className="day-header">
        <div className="day-info" onClick={() => setIsOpen(!isOpen)} style={{cursor: "pointer", flex: 1}}>
          <strong>{day.date?.replace(/-/g, ".") + "."}</strong>
          <div className="day-category-dots">
            {day.categories.map((cat, i) => (
              <span key={i} className="small-dot" style={{ backgroundColor: cat.color?.startsWith('#') ? cat.color : `#${cat.color || 'ccc'}` }} title={`${cat.name}: ${cat.total.toLocaleString()} Ft`} />
            ))}
          </div>
        </div>

        <div className="day-actions-total">
            {day.isOverLimit && (
              <span style={{ 
                color: "#ef4444", 
                fontSize: "0.7rem", 
                fontWeight: "700", 
                marginRight: "10px",
                textTransform: "uppercase",
                backgroundColor: "#fee2e2",
                padding: "2px 8px",
                borderRadius: "4px",
                border: "1px solid #fecaca"
              }}>
                Havi limit túllépve
              </span>
            )}

          <div className="day-total" style={{ color: day.isOverLimit ? "#ef4444" : "inherit", fontWeight: day.isOverLimit ? "700" : "500" }}>
            {day.total.toLocaleString()} Ft
          </div>
          
          {isEditing ? (
            <>
              <button className="icon-btn" onClick={handleSave}><Save size={20} color="#16a34a" /></button>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}><X size={20} color="#dc2626" /></button>
            </>
          ) : (
            <>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsOpen(true); }}><Edit2 size={18} /></button>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={18} /></button>
              <button className="icon-btn" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
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
                onEntryChange={(entryIndex, field, val) => {
                  const newCats = [...localCategories];
                  newCats[catIndex].entries[entryIndex][field] = val;
                  setLocalCategories(newCats);
                }}
                onAddEntry={() => {
                  const newCats = [...localCategories];
                  newCats[catIndex].entries.push({ id: `temp-${Date.now()}`, description: "", amount: "" });
                  setLocalCategories(newCats);
                }}
                onDeleteEntry={onDeleteEntry}
                onDeleteCategory={() => onDeleteCategory('category', cat.id, cat.name)}
            />
          ))}
          {isEditing && (
             <div className="add-category-section" style={{marginTop: "10px"}}>
                 <select className="category-select" style={{width: "100%", padding: "8px"}} onChange={async (e) => {
                    await fetch("/api/add_koltesi_kategoria", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ datum: day.date, kategoria_id: e.target.value })
                    });
                    await onRefresh(false);
                 }} value="">
                     <option value="" disabled>+ Új kategória hozzáadása...</option>
                     {categoryNames.map(cn => <option key={cn[0]} value={cn[0]}>{cn[1]}</option>)}
                 </select>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const CategoryCard = ({ category, isEditing, onEntryChange, onAddEntry, onDeleteEntry, onDeleteCategory }) => {
  const color = category.color?.startsWith('#') ? category.color : `#${category.color || 'ccc'}`;
  return (
    <div className="category-card" style={{borderColor: color}}>
      <div className="category-header">
        <div className="category-left">
          <span className="color-dot" style={{ backgroundColor: color }}></span>
          <span className="category-name">{category.name}</span>
        </div>
        <div style={{display: "flex", alignItems: "center"}}>
            <div className="category-total">{category.total.toLocaleString()} Ft</div>
            {isEditing && <button className="icon-btn" onClick={onDeleteCategory} style={{color: "#dc2626", marginLeft: "8px"}}><Trash2 size={16} /></button>}
        </div>
      </div>
      <div className="category-entries">
        {category.entries.map((entry, idx) => (
          <EntryRow key={entry.id || idx} entry={entry} isEditing={isEditing} onChange={(f, v) => onEntryChange(idx, f, v)} onDelete={() => onDeleteEntry('entry', entry.id, entry.description)} />
        ))}
        {isEditing && <button className="add-entry-btn" onClick={onAddEntry} style={{width: "100%"}}><Plus size={14} /> Új tétel</button>}
      </div>
    </div>
  );
};

const EntryRow = ({ entry, isEditing, onChange, onDelete }) => {
  if (isEditing) {
    return (
      <div className="entry-item-container" style={{display: "flex", gap: "5px", marginBottom: "5px"}}>
        <input type="text" className="entry-description-input" style={{flex: 2}} placeholder="Leírás" value={entry.description} onChange={(e) => onChange('description', e.target.value)} />
        <input type="number" className="entry-amount-input" style={{flex: 1}} placeholder="Ft" value={entry.amount} onChange={(e) => onChange('amount', e.target.value)} />
        <button className="icon-btn" onClick={onDelete}><Trash2 size={16} color="#dc2626"/></button>
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