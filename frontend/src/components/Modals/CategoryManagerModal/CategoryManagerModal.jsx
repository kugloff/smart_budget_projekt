import React, { useState, useEffect } from "react";
import { Trash2, Loader, CheckCircle, XCircle, Save } from "lucide-react";
import "../CategoryManagerModal/CategoryManagerModal.css";

const fetchWithBackoff = async (url, options = {}, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`API hiba (${response.status}): ${responseText}`);
            }
            return response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const ConfirmModal = ({ isOpen, onConfirm, onCancel, message, categoryName }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <p className="confirm-message">{message} **{categoryName}**?</p>
                <div className="modal-buttons">
                    <button className="close-button" onClick={onCancel}>Mégse</button>
                    <button className="delete-button" onClick={onConfirm}>Törlés</button>
                </div>
            </div>
        </div>
    );
};

export const CategoryManagerModal = ({ isOpen, onClose }) => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: "", color: "#e0e0e0" });
    const [confirmIndex, setConfirmIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); 

   const fetchCategories = async () => {
    setLoading(true);
    try {
        const data = await fetchWithBackoff("/api/get_kategoria_nevek");
        const formattedCategories = data.map(cat => {
            let colorHex = String(cat[2]);
            
            while (colorHex.length < 6) {
                colorHex = '0' + colorHex;
            }
            
            return {
                id: cat[0],
                name: cat[1],
                color: `#${colorHex}`,
            };
        });
        
        formattedCategories.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setCategories(formattedCategories);
    } catch (error) {
        setStatus({ type: 'error', message: `Betöltési hiba: ${error.message}` });
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        if (isOpen) fetchCategories();
    }, [isOpen]);

    const updateLocalState = (categoryId, field, value) => {
        setCategories(prev => prev.map(c => 
            c.id === categoryId ? { ...c, [field]: value } : c
        ));
    };

    const handleSaveEdit = async (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        if (!cat) return;

        try {
            setLoading(true);
            setStatus(null);

            await fetchWithBackoff("/api/edit_kategoria_nev", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryId, nev: cat.name })
            });

            const cleanColor = cat.color.startsWith('#') ? cat.color.slice(1) : cat.color;
            await fetchWithBackoff("/api/edit_kategoria_nev", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryId, szin_kod: cleanColor })
            });

            setStatus({ type: 'success', message: 'Sikeres mentés!' });
            
            await fetchCategories();

            setTimeout(() => {
                setStatus(null);
            }, 3000);

        } catch (error) {
            setStatus({ type: 'error', message: `Mentési hiba: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        const name = newCategory.name.trim();
        if (!name) return;
        try {
            setLoading(true);
            const cleanColor = newCategory.color.startsWith('#') ? newCategory.color.slice(1) : newCategory.color;
            await fetchWithBackoff("/api/add_kategoria_nev", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nev: name, szin_kod: cleanColor })
            });
            setNewCategory({ name: "", color: "#e0e0e0" });
            await fetchCategories();
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        const categoryToDelete = categories[confirmIndex];
        setConfirmIndex(null);
        try {
            setLoading(true);
            await fetchWithBackoff("/api/delete_kategoria_nev", {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryToDelete.id })
            });
            await fetchCategories();
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2 className="modal-title">Kategóriák kezelése</h2>

                    {status && (
                        <div className={`status-message status-${status.type}`} style={{
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da',
                            color: status.type === 'success' ? '#155724' : '#721c24',
                            border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            {status.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            <span>{status.message}</span>
                        </div>
                    )}

                    <div className="category-list">
                        {loading && <div className="loading-spinner"><Loader size={20} className="animate-spin" /></div>}
                        
                        {categories.map((cat, i) => (
                            <div key={cat.id || i} className="category-row">
                                <input
                                    type="color"
                                    value={cat.color}
                                    onChange={e => updateLocalState(cat.id, 'color', e.target.value)}
                                    className="color-picker-small"
                                />
                                <input
                                    type="text"
                                    value={cat.name}
                                    onChange={e => updateLocalState(cat.id, 'name', e.target.value)}
                                    className="category-name-input"
                                />

                                <div className="category-row-buttons" style={{ display: 'flex', gap: '8px' }}>
                                    <button className="delete-btn" onClick={() => setConfirmIndex(i)} title="Kategória törlése">
                                        <Trash2 size={16} /> Törlés
                                    </button>
                                    <button className="save-btn" onClick={() => handleSaveEdit(cat.id)} title="Kategória mentése">
                                        <Save size={16} /> Mentés
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="add-category-section">
                        <div className="add-category-label">Új kategória hozzáadása</div>
                        <div className="add-category">
                            <input
                                type="color"
                                value={newCategory.color}
                                onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                                className="color-picker-large"
                            />
                            <input
                                type="text"
                                placeholder="Név"
                                value={newCategory.name}
                                onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="new-category-input"
                            />
                            <button className="add-btn" onClick={handleAddCategory} disabled={loading}>Hozzáadás</button>
                        </div>
                    </div>

                    <div className="category-modal-buttons">
                        <button className="category-close-btn" onClick={onClose}>Bezárás</button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmIndex !== null}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmIndex(null)}
                message="Biztosan törölni szeretnéd a kategóriát"
                categoryName={confirmIndex !== null ? categories[confirmIndex].name : ""}
            />
        </>
    );
};