import React from "react";
import { Trash2 } from "lucide-react";
import "./DayCard.css";

export const EntryItem = ({ entry, isEditing, onDelete, onEntryChange }) => {
  const [description, setDescription] = useState(entry.description || "");
  const [amount, setAmount] = useState(entry.amount || entry.osszeg || 0);

  useEffect(() => {
    setDescription(entry.description || "");
    setAmount(entry.amount || entry.osszeg || 0);
  }, [entry]);

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    if (onEntryChange) {
      onEntryChange(entry.id, { 
        description: newDescription, 
        amount: Number(amount),
      });
    }
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value === "" ? 0 : Number(e.target.value);
    setAmount(newAmount);
    if (onEntryChange) {
      onEntryChange(entry.id, { 
        description, 
        amount: newAmount,
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && entry.id) {
      onDelete(entry.id); 
    }
  };

  return (
    <div className="entry-item-container">
      {isEditing ? (
        <>
          <input
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Új tétel"
            className="entry-description-input"
          />
          <input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Összeg"
            className="entry-amount-input"
          />
          <button 
            className="delete-entry-btn" 
            onClick={handleDelete}
            title="Tétel törlése"
          >
            <Trash2 size={16} />
          </button>
        </>
      ) : (
        <>
          <span className="entry-description">{entry.description || entry.leiras}</span>
          <span className="entry-amount">{(entry.amount || entry.osszeg || 0).toLocaleString()} Ft</span>
        </>
      )}
    </div>
  );
};