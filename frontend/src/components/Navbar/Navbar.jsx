import React, { useState } from 'react';
import './Navbar.css';
import { LimitModal } from '../LimitModal/LimitModal';
import { CategoryManagerModal } from '../CategoryManagerModal/CategoryManagerModal';

export const Navbar = ({ onOpenAddDayModal, onLogout }) => {
	const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [limit, setLimit] = useState(0);

	const currentPage = window.REACT_PAGE || 'login';
	const isLoggingIn = currentPage === 'login';

	return (
		<nav className="container">
			<div className="top-row">
				<ul className={`left ${isLoggingIn ? 'hidden' : 'visible'}`}>
					<li className={currentPage === 'expenses' ? 'active' : ''}>
						<a href="/expenses">Kiadások</a>
					</li>
					<li className={currentPage === 'analysis' ? 'active' : ''}>
						<a href="/analysis">Elemzés</a>
					</li>
					{currentPage === 'expenses' && (
						<li className="limit-button" onClick={() => setIsLimitModalOpen(true)}>
							Költési limit beállítása
						</li>
					)}
				</ul>

				<h1>SmartBudget</h1>

				<ul className={`right ${isLoggingIn ? 'hidden' : 'visible'}`}>
					<li className={currentPage === 'ai' ? 'active' : ''}>
						<a href="/ai">AI-alapú tanácsadás</a>
					</li>
					{!isLoggingIn && (
						<li className="logout-button" onClick={() => window.location.href = '/'}>
              Kijelentkezés
            </li>
					)}
				</ul>
			</div>

			<div className="bottom-row">
				<div className="bottom-buttons">
					{currentPage === 'expenses' ? (
						<>
							<button onClick={onOpenAddDayModal}>Új nap hozzáadása</button>
							<button onClick={() => setIsCategoryModalOpen(true)}>Kategóriák kezelése</button>
						</>
					) : (
						<span style={{ visibility: 'hidden' }}>Placeholder</span>
					)}
				</div>

				<span className="status">
					{currentPage === 'login'
						? 'Bejelentkezés / Regisztráció'
						: currentPage === 'expenses'
						? 'Kiadások'
						: currentPage === 'analysis'
						? 'Elemzés'
						: currentPage === 'ai'
						? 'AI-alapú tanácsadás'
						: ''}
				</span>
			</div>

			<LimitModal
				isOpen={isLimitModalOpen}
				onClose={() => setIsLimitModalOpen(false)}
				onSave={() => {
					console.log('Limit mentve:', limit);
					setIsLimitModalOpen(false);
				}}
				limit={limit}
				setLimit={setLimit}
			/>

			<CategoryManagerModal
				isOpen={isCategoryModalOpen}
				onClose={() => setIsCategoryModalOpen(false)}
			/>
		</nav>
	);
};