import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    createCompany,
    deleteCompany,
    getCompanies,
    updateCompany,
} from '../api/endpoints/companies';
import { getCategoryCompanies } from '../api/endpoints/categoryCompanies';

type CompanyStatus = 'Active' | 'Inactive';

type Company = {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: CompanyStatus;
    categoryCompanyId?: number | null;
    categoryCompanyName?: string;
};

type CompanyCategory = {
    id: number;
    name: string;
};

type CompanyFormState = {
    name: string;
    email: string;
    phone: string;
    status: CompanyStatus;
    categoryCompanyId: string;
};

type ToastType = 'success' | 'error';

const emptyForm: CompanyFormState = {
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    categoryCompanyId: '',
};

const Companies: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<Company[]>([]);
    const [companyCategories, setCompanyCategories] = useState<CompanyCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState<CompanyFormState>(emptyForm);
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
        () => (editingId === null ? 'Add Company' : 'Edit Company'),
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

            console.error('Companies error:', apiError.response?.data || apiError.message);

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

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        try {
            const { raw, list } = await getCompanies();
            console.log('Companies response:', raw);
            setData(list as Company[]);
        } catch (apiError) {
            handleApiError(apiError);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyCategories = async () => {
        try {
            const { raw, list } = await getCategoryCompanies();
            console.log('Category companies response:', raw);
            setCompanyCategories(list as CompanyCategory[]);
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchCompanyCategories();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        setFormState(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (company: Company) => {
        setEditingId(company.id);
        setFormState({
            name: company.name,
            email: company.email,
            phone: company.phone,
            status: company.status,
            categoryCompanyId: company.categoryCompanyId ? String(company.categoryCompanyId) : '',
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

        const payload = {
            name: formState.name.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            status: formState.status,
            ...(formState.categoryCompanyId
                ? {
                      category_company: Number(formState.categoryCompanyId),
                      category_company_id: Number(formState.categoryCompanyId),
                  }
                : {}),
        };

        if (!payload.name || !payload.email || !payload.phone) {
            return;
        }

        try {
            if (editingId === null) {
                await createCompany(payload);
                showToast('Company added successfully');
            } else {
                await updateCompany(editingId, payload);
                showToast('Company updated successfully');
            }

            closeModal();
            await fetchCompanies();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    const handleDelete = async (company: Company) => {
        const confirmed = window.confirm(`Delete company "${company.name}"?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteCompany(company.id);
            showToast('Company deleted successfully');
            await fetchCompanies();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    return (
        <section className="cyber-section-card">
            <div className="crud-page-header">
                <div>
                    <p className="cyber-page-kicker">Operations</p>
                    <h1 className="cyber-standalone-title">Companies</h1>
                </div>
                <button type="button" className="crud-add-button" onClick={openAddModal}>
                    Add Company
                </button>
            </div>

            <div className="crud-table-wrap">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Company Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((company) => (
                            <tr key={company.id}>
                                <td>{company.id}</td>
                                <td>{company.name}</td>
                                <td>{company.email}</td>
                                <td>{company.phone}</td>
                                <td>{company.categoryCompanyName || 'Unassigned'}</td>
                                <td>
                                    <span
                                        className={`crud-status-badge ${
                                            company.status === 'Active'
                                                ? 'crud-status-active'
                                                : 'crud-status-inactive'
                                        }`}
                                    >
                                        {company.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="crud-actions">
                                        <button
                                            type="button"
                                            className="crud-action-button"
                                            onClick={() => openEditModal(company)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="crud-action-button crud-action-danger"
                                            onClick={() => handleDelete(company)}
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

            {loading ? <div className="crud-loading">Loading companies...</div> : null}
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
                                <span>Company Name</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formState.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter company name"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleInputChange}
                                    placeholder="company@email.com"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Phone</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formState.phone}
                                    onChange={handleInputChange}
                                    placeholder="+1 555 111 2233"
                                    required
                                />
                            </label>

                            <label className="crud-field">
                                <span>Status</span>
                                <select name="status" value={formState.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </label>

                            <label className="crud-field">
                                <span>Company Category</span>
                                <select
                                    name="categoryCompanyId"
                                    value={formState.categoryCompanyId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select category</option>
                                    {companyCategories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <div className="crud-modal-actions">
                                <button type="button" className="crud-action-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="crud-add-button">
                                    {editingId === null ? 'Create Company' : 'Save Changes'}
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

export default Companies;