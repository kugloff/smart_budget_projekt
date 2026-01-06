import React, { useState, useEffect } from "react";
import { Trash2, Loader, CheckCircle, XCircle } from "lucide-react";
import "../CategoryManagerModal/CategoryManagerModal.css";

const fetchWithBackoff = async (url, options = {}, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // ÚJ NAPLÓZÁS ÉS RÉSZLETESEBB HIBAKEZELÉS A DEBUGOLÁSHOZ
                const responseText = await response.text();
                let errorData = { message: `Ismeretlen API hiba. (HTTP ${response.status})` };
                
                // Megpróbáljuk JSON-ként feldolgozni a választ a részletesebb üzenetért
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    // Ha nem JSON, a szöveges választ használjuk (max 100 karakter)
                    errorData.message += responseText ? `: ${responseText.substring(0, 100)}...` : '';
                }

                // Naplózzuk a kérés tartalmát a konzolra, ha rendelkezésre áll (POST/PUT/DELETE debug)
                if (options.body) {
                    try {
                        console.error("API Hiba Kérés Adatok:", JSON.parse(options.body));
                    } catch (e) {
                        console.error("API Hiba Kérés Adatok:", options.body);
                    }
                }
                
                throw new Error(`API hiba (${response.status}): ${errorData.message || 'Hiba történt a szerveren.'}`);
            }
            return response.json();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; // Utolsó próbálkozásnál dobjuk az eredeti hibát
            }
            // Visszalépés (2^i másodperc, pl. 1s, 2s, 4s)
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// --- Components ---

// Ez csak a törlést megerősítő modal
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
    const [status, setStatus] = useState(null); // { type: 'success'/'error', message: '...' }

    // --- Data Fetching ---

    const fetchCategories = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const data = await fetchWithBackoff("/api/get_kategoria_nevek");
            
            const formattedCategories = data.map(cat => ({
				id: cat[0],
				name: cat[1],
				color: `#${cat[2]}`, // fontos: HEX-hez #
			}));

            // FIX: Biztonságosan kezeljük a rendezést (ha a név undefined/null, üres stringként kezeli)
            formattedCategories.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            
            setCategories(formattedCategories);
            setStatus(null); 
        } catch (error) {
            console.error("Kategóriák lekérése hiba:", error);
            setStatus({ type: 'error', message: `Kategóriák betöltése sikertelen: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // Első betöltés
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    // --- HANDLERS ---

    // Kategória hozzáadása a Flask API-hoz
    const handleAddCategory = async () => {
        const name = newCategory.name.trim();
        if (!name) {
            setStatus({ type: 'error', message: 'Kérem, adjon meg nevet.' });
            return;
        }

        // FIX: Biztonságosan ellenőrizzük a létezést. (c.name || "")
        if (categories.some(c => (c.name || "").toLowerCase() === name.toLowerCase())) {
            setStatus({ type: 'error', message: 'Ez a kategória már létezik!' });
            return;
        }

        try {
            setLoading(true);
            setStatus(null);
            
            await fetchWithBackoff("/api/add_kategoria_nev", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    nev: name, 
                    // VÉDEKEZŐ VÁLTOZTATÁS: Biztosítjuk, hogy a színkód soha ne legyen üres vagy null
                    szin_kod: newCategory.color || "#e0e0e0"
                })
            });
            
            setNewCategory({ name: "", color: "#e0e0e0" });
            setStatus({ type: 'success', message: 'Kategória sikeresen hozzáadva.' });
            await fetchCategories(); // Frissíti a listát
        } catch (error) {
            console.error("Hiba a hozzáadáskor:", error);
            setStatus({ type: 'error', message: `Hiba a hozzáadáskor: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    // Kategória frissítése
    const handleCategoryChange = async (categoryId, field, value) => {
        const categoryToUpdate = categories.find(c => c.id === categoryId);
        if (!categoryToUpdate) return;
        
        // Helyi állapot azonnali frissítése a jobb UX érdekében
        setCategories(prev => prev.map(c => 
            c.id === categoryId ? { ...c, [field]: value } : c
        ));

        // Melyik mezőt küldjük el (name -> nev, color -> szin_kod)
        let body;
        if (field === 'name') {
            body = { id: categoryId, nev: value };
        } else if (field === 'color') {
            body = { id: categoryId, szin_kod: value };
        } else {
            return;
        }

        try {
            setStatus(null);
            await fetchWithBackoff("/api/edit_kategoria_nev", {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            setStatus({ type: 'success', message: 'Kategória frissítve.' });
        } catch (error) {
            console.error("Hiba a frissítéskor:", error);
            setStatus({ type: 'error', message: `Hiba a frissítéskor: ${error.message}` });
            await fetchCategories(); // Hiba esetén visszatöltjük a helyes állapotot
        }
    };

    // Törlés előtti megerősítés beállítása
    const handleDelete = (index) => {
        setConfirmIndex(index);
    };

    // Törlés végrehajtása
    const confirmDelete = async () => {
        const categoryToDelete = categories[confirmIndex];
        setConfirmIndex(null); // Bezárjuk a modált azonnal

        if (!categoryToDelete || !categoryToDelete.id) {
            setStatus({ type: 'error', message: 'Érvénytelen kategória a törléshez.' });
            return;
        }

        try {
            setLoading(true);
            setStatus(null);
            
            await fetchWithBackoff("/api/delete_kategoria_nev", {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: categoryToDelete.id }) // Feltételezve, hogy a DELETE egy JSON body-t vár
            });

            setStatus({ type: 'success', message: `A kategória ("${categoryToDelete.name}") sikeresen törölve.` });
            await fetchCategories(); // Frissíti a listát
        } catch (error) {
            console.error("Hiba a törléskor:", error);
            setStatus({ type: 'error', message: `Hiba a törléskor: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => setConfirmIndex(null);

    // Ha a modál zárva van
    if (!isOpen) return null;

    // A törléshez szükséges kategória adatok
    const categoryToConfirm = categories[confirmIndex];
    const categoryName = categoryToConfirm ? categoryToConfirm.name : '';

    return (
        <>
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2 className="modal-title">Kategóriák kezelése</h2>

                    {/* Státusz üzenetek */}
                    {status && (
                        <div className={`status-message status-${status.type}`}>
                            {status.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <p>{status.message}</p>
                            <button onClick={() => setStatus(null)} className="status-close-btn">X</button>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-spinner"><Loader size={24} className="animate-spin" /> Adatok betöltése...</div>
                    )}
                    
                    {/* categories.map */}
                    <div className="category-list">
                        {categories.map((cat, i) => (
                            <div key={cat.id || i} className="category-row">
                                {/* Szín választó */}
                                <input
                                    type="color"
                                    // A color értékét szinkronizáljuk a helyi állapottal
                                    value={cat.color || "#e0e0e0"}
                                    onChange={e => handleCategoryChange(cat.id, 'color', e.target.value)}
                                    className="color-picker-small"
                                    title="Kategória színének módosítása"
                                />
                                
                                {/* Név bemenet */}
                                <input
                                    type="text"
                                    // A name értékét szinkronizáljuk a helyi állapottal
                                    value={cat.name || ""}
                                    onChange={e => handleCategoryChange(cat.id, 'name', e.target.value)}
                                    className="category-name-input"
                                />

                                <button className="delete-btn" onClick={() => handleDelete(i)} title="Kategória törlése">
                                    <Trash2 size={16} /> Törlés
                                </button>
                            </div>
                        ))}
                    </div>

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
                            placeholder="Új kategória neve"
                            value={newCategory.name}
                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                            className="new-category-input"
                        />
                        <button 
                            className="add-btn" 
                            onClick={handleAddCategory} 
                            disabled={!newCategory.name.trim() || loading}
                        >
                            Hozzáadás
                        </button>
                    </div>

                    <div className="category-modal-buttons">
                        <button className="category-close-btn" onClick={onClose}>Bezárás</button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmIndex !== null}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                message="Biztosan törölni szeretnéd a kategóriát"
                categoryName={categoryName}
            />
            
        </>
    );
};

