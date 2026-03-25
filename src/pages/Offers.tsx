import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    createOffer,
    deleteOffer,
    getOffers,
    updateOffer,
} from '../api/endpoints/offers';

type OfferStatus = 'Active' | 'Expired';

type Offer = {
    id: number;
    title: string;
    discount: number;
    startDate: string;
    endDate: string;
    status: OfferStatus;
};

type OfferFormState = {
    title: string;
    discount: string;
    startDate: string;
    endDate: string;
    status: OfferStatus;
};

type ToastType = 'success' | 'error';

const emptyForm: OfferFormState = {
    title: '',
    discount: '',
    startDate: '',
    endDate: '',
    status: 'Active',
};

const Offers: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState<OfferFormState>(emptyForm);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<ToastType>('success');
    const toastTimerRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) {
                window.clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    const modalTitle = useMemo(() => (editingId === null ? 'Add Offer' : 'Edit Offer'), [editingId]);

    const fetchOffers = async () => {
        const { list } = await getOffers();
        setOffers(list as Offer[]);
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToastMessage(message);
        setToastType(type);
        if (toastTimerRef.current) {
            window.clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = window.setTimeout(() => {
            setToastMessage('');
        }, 2200);
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormState(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (offer: Offer) => {
        setEditingId(offer.id);
        setFormState({
            title: offer.title,
            discount: offer.discount.toString(),
            startDate: offer.startDate,
            endDate: offer.endDate,
            status: offer.status,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormState(emptyForm);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const parsedDiscount = Number(formState.discount);
        const nextOffer: Offer = {
            id: editingId ?? 0,
            title: formState.title.trim(),
            discount: Number.isNaN(parsedDiscount) ? 0 : parsedDiscount,
            startDate: formState.startDate,
            endDate: formState.endDate,
            status: formState.status,
        };

        if (!nextOffer.title || !nextOffer.startDate || !nextOffer.endDate) {
            return;
        }

        if (editingId === null) {
            await createOffer(nextOffer);
            showToast('Offer added successfully');
        } else {
            await updateOffer(editingId, nextOffer);
            showToast('Offer updated successfully');
        }

        closeModal();
        await fetchOffers();
    };

    const handleDelete = async (offer: Offer) => {
        const confirmed = window.confirm(`Delete offer "${offer.title}"?`);
        if (!confirmed) {
            return;
        }

        await deleteOffer(offer.id);
        showToast('Offer deleted successfully');
        await fetchOffers();
    };

    return (
        <section className="cyber-section-card">
            <div className="crud-page-header">
                <div>
                    <p className="cyber-page-kicker">Operations</p>
                    <h1 className="cyber-standalone-title">Offers</h1>
                </div>
                <button type="button" className="crud-add-button" onClick={openAddModal}>
                    Add Offer
                </button>
            </div>

            <div className="crud-table-wrap">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Discount %</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map((offer) => (
                            <tr key={offer.id}>
                                <td>{offer.id}</td>
                                <td>{offer.title}</td>
                                <td>{offer.discount}%</td>
                                <td>{offer.startDate}</td>
                                <td>{offer.endDate}</td>
                                <td>
                                    <span
                                        className={`crud-status-badge ${
                                            offer.status === 'Active'
                                                ? 'crud-status-active'
                                                : 'crud-status-expired'
                                        }`}
                                    >
                                        {offer.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="crud-actions">
                                        <button
                                            type="button"
                                            className="crud-action-button"
                                            onClick={() => openEditModal(offer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="crud-action-button crud-action-danger"
                                            onClick={() => handleDelete(offer)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen ? (
                <div
                    className="crud-modal-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-label={modalTitle}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="crud-modal-panel">
                        <div className="crud-modal-head">
                            <h2>{modalTitle}</h2>
                            <button
                                type="button"
                                className="crud-modal-close"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                X
                            </button>
                        </div>
                        <form className="crud-form" onSubmit={handleSubmit}>
                            <label className="crud-field">
                                <span>Title</span>
                                <input
                                    type="text"
                                    name="title"
                                    value={formState.title}
                                    onChange={handleInputChange}
                                    placeholder="Offer title"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Discount %</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    name="discount"
                                    value={formState.discount}
                                    onChange={handleInputChange}
                                    placeholder="0 - 100"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Start Date</span>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formState.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>End Date</span>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formState.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Status</span>
                                <select name="status" value={formState.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </label>

                            <div className="crud-modal-actions">
                                <button type="button" className="crud-action-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="crud-add-button">
                                    {editingId === null ? 'Create Offer' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}

            {toastMessage ? (
                <div className={toastType === 'error' ? 'crud-toast-error' : 'crud-toast-success'}>
                    {toastMessage}
                </div>
            ) : null}
        </section>
    );
};

export default Offers;