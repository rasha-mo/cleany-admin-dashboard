import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
} from '../api/endpoints/users';

type UserStatus = 'Active' | 'Inactive';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: UserStatus;
};

type UserFormState = {
    name: string;
    email: string;
    phone: string;
    role: string;
    status: UserStatus;
};

type ToastType = 'success' | 'error';

const emptyForm: UserFormState = {
    name: '',
    email: '',
    phone: '',
    role: 'User',
    status: 'Active',
};

const Users: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formState, setFormState] = useState<UserFormState>(emptyForm);
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
        () => (editingId === null ? 'Add User' : 'Edit User'),
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

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { list } = await getUsers();
            setData(list as User[]);
        } catch (apiError) {
            handleApiError(apiError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        setFormState(emptyForm);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setEditingId(user.id);
        setFormState({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
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
            full_name: formState.name.trim(),
            username: formState.email.trim().split('@')[0] || formState.name.trim(),
            email: formState.email.trim(),
            phone: formState.phone.trim(),
            role: formState.role.trim(),
            status: formState.status,
            is_active: formState.status === 'Active',
        };

        if (!payload.name || !payload.email || !payload.phone) {
            return;
        }

        try {
            if (editingId === null) {
                await createUser(payload);
                showToast('User added successfully');
            } else {
                await updateUser(editingId, payload);
                showToast('User updated successfully');
            }

            closeModal();
            await fetchUsers();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    const handleDelete = async (user: User) => {
        const confirmed = window.confirm(`Delete user "${user.name}"?`);
        if (!confirmed) {
            return;
        }

        try {
            await deleteUser(user.id);
            showToast('User deleted successfully');
            await fetchUsers();
        } catch (apiError) {
            handleApiError(apiError);
        }
    };

    return (
        <section className="cyber-section-card">
            <div className="crud-page-header">
                <div>
                    <p className="cyber-page-kicker">Operations</p>
                    <h1 className="cyber-standalone-title">Users</h1>
                </div>
                <button type="button" className="crud-add-button" onClick={openAddModal}>
                    Add User
                </button>
            </div>

            <div className="crud-table-wrap">
                <table className="crud-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.role}</td>
                                <td>
                                    <span
                                        className={`crud-status-badge ${
                                            user.status === 'Active'
                                                ? 'crud-status-active'
                                                : 'crud-status-inactive'
                                        }`}
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="crud-actions">
                                        <button
                                            type="button"
                                            className="crud-action-button"
                                            onClick={() => openEditModal(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="crud-action-button crud-action-danger"
                                            onClick={() => handleDelete(user)}
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

            {loading ? <div className="crud-loading">Loading users...</div> : null}
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
                                    placeholder="Enter full name"
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
                                    placeholder="user@email.com"
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
                                <span>Role</span>
                                <input
                                    type="text"
                                    name="role"
                                    value={formState.role}
                                    onChange={handleInputChange}
                                    placeholder="Admin / Manager / Support"
                                />
                            </label>

                            <label className="crud-field">
                                <span>Status</span>
                                <select name="status" value={formState.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </label>

                            <div className="crud-modal-actions">
                                <button type="button" className="crud-action-button" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="crud-add-button">
                                    {editingId === null ? 'Create User' : 'Save Changes'}
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

export default Users;