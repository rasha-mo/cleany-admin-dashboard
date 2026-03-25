import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
} from '../api/endpoints/categories';

type Category = {
    id: number;
    name: string;
    icon?: string;
    image?: string;
};

type CategoryFormState = {
    name: string;
    iconText: string;
    iconPreview: string;
    iconFile: File | null;
};

type ToastType = 'success' | 'error';

const emptyForm: CategoryFormState = {
    name: '',
    iconText: '',
    iconPreview: '',
    iconFile: null,
};

const Categories: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState<CategoryFormState>(emptyForm);
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

    const modalTitle = useMemo(
        () => (editingId === null ? 'Add Category' : 'Edit Category'),
        [editingId],
    );

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

    const stringifyError = (value: unknown): string => {
        if (typeof value === 'string') {
            return value;
        }
        if (value && typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (_error) {
                return 'Unexpected error occurred';
            }
        }
        return 'Unexpected error occurred';
    };

    const getCategoryIcon = (category: Category): string => {
        return category.icon || category.image || '🏷️';
    };

    const handleApiError = (apiError: unknown) => {
        if (axios.isAxiosError(apiError)) {
            const status = apiError.response?.status;
            const detailMessage =
                (apiError.response?.data as { detail?: string; message?: string } | undefined)?.detail ||
                (apiError.response?.data as { detail?: string; message?: string } | undefined)?.message ||
                stringifyError(apiError.response?.data) ||
                apiError.message;

            if (status === 401) {
                navigate('/login');
                return;
            }

            console.error('Categories error:', apiError.response?.data || apiError.message);

            setError(detailMessage);

            if (status === 404 || status === 500) {
                showToast('Server request failed. Please try again.', 'error');
            } else {
                showToast(detailMessage, 'error');
            }
            return;
        }

        const fallback = 'Unexpected error occurred';
        setError(fallback);
        showToast(fallback, 'error');
    };

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const { raw, list } = await getCategories();
            console.log('Categories response:', raw);
            setData(list);
        } catch (apiError) {
            handleApiError(apiError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        setFormState(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        const categoryIcon = getCategoryIcon(category);
        setEditingId(category.id);
        setFormState({
            name: category.name,
            iconText: categoryIcon.startsWith('http') || categoryIcon.startsWith('data:image/') ? '' : categoryIcon,
            iconPreview:
                categoryIcon.startsWith('http') || categoryIcon.startsWith('data:image/')
                    ? categoryIcon
                    : '',
            iconFile: null,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormState(emptyForm);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setFormState((prev) => ({
            ...prev,
            iconFile: file,
            iconPreview: URL.createObjectURL(file),
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = formState.name.trim();
        if (!trimmedName) {
            return;
        }

        try {
            let payload: FormData | { name: string; icon?: string };

            if (formState.iconFile) {
                const formData = new FormData();
                formData.append('name', trimmedName);
                formData.append('icon', formState.iconFile);
                payload = formData;
            } else {
                payload = {
                    name: trimmedName,
                    ...(formState.iconText.trim() ? { icon: formState.iconText.trim() } : {}),
                };
            }

            if (editingId === null) {
                await createCategory(payload);
                showToast('Category added successfully');
            } else {
                await updateCategory(editingId, payload);
                showToast('Category updated successfully');
            }

            closeModal();
            await fetchCategories();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    const handleDelete = async (category: Category) => {
        const confirmed = window.confirm(`Delete category "${category.name}"?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteCategory(category.id);
            showToast('Category deleted successfully');
            await fetchCategories();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    return (
        <section className="cyber-section-card">
            <div className="crud-page-header">
                <div>
                    <p className="cyber-page-kicker">Operations</p>
                    <h1 className="cyber-standalone-title">Categories</h1>
                </div>
                <button type="button" className="crud-add-button" onClick={openAddModal}>
                    Add Category
                </button>
            </div>

            <div className="crud-table-wrap">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Icon/Image</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>
                                    {getCategoryIcon(category).startsWith('http') ||
                                    getCategoryIcon(category).startsWith('data:image/') ? (
                                        <img
                                            className="crud-category-image"
                                            src={getCategoryIcon(category)}
                                            alt={`${category.name} icon`}
                                        />
                                    ) : (
                                        <span className="crud-emoji-icon">{getCategoryIcon(category)}</span>
                                    )}
                                </td>
                                <td>
                                    <div className="crud-actions">
                                        <button
                                            type="button"
                                            className="crud-action-button"
                                            onClick={() => openEditModal(category)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="crud-action-button crud-action-danger"
                                            onClick={() => handleDelete(category)}
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

            {loading ? <div className="crud-loading">Loading categories...</div> : null}
            {error ? <div className="crud-error-inline">{error}</div> : null}

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
                                <span>Name</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter category name"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Icon (emoji)</span>
                                <input
                                    type="text"
                                    name="iconText"
                                    value={formState.iconText}
                                    onChange={handleInputChange}
                                    placeholder="Example: 📦"
                                />
                            </label>

                            <label className="crud-field">
                                <span>Icon/Image upload</span>
                                <input type="file" accept="image/*" onChange={handleFileUpload} />
                            </label>

                            {(formState.iconPreview || formState.iconText) && (
                                <div className="crud-preview-row">
                                    <span>Preview</span>
                                    {formState.iconPreview ? (
                                        <img className="crud-category-image" src={formState.iconPreview} alt="Preview" />
                                    ) : (
                                        <span className="crud-emoji-icon">{formState.iconText}</span>
                                    )}
                                </div>
                            )}

                            <div className="crud-modal-actions">
                                <button type="button" className="crud-action-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="crud-add-button">
                                    {editingId === null ? 'Create Category' : 'Save Changes'}
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

export default Categories;