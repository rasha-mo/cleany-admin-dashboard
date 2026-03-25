/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import axiosInstance from '../axios';
import axios from 'axios';

const fallbackCategoryCompanies = [
    { id: 1, name: 'Retail' },
    { id: 2, name: 'Services' },
    { id: 3, name: 'Logistics' },
    { id: 4, name: 'Technology' },
];

const normalizeCategory = (item, index) => {
    const record = item && typeof item === 'object' ? item : {};
    return {
        id: record.id || record.category_company_id || record.pk || index + 1,
        name: record.name || record.title || record.category_name || `Category ${index + 1}`,
    };
};

const extractCategoryCompaniesArray = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (payload && typeof payload === 'object') {
        const nestedData = payload.data && typeof payload.data === 'object' ? payload.data : null;

        if (Array.isArray(payload.data)) {
            return payload.data;
        }
        if (Array.isArray(payload.results)) {
            return payload.results;
        }
        if (Array.isArray(payload.category_companies)) {
            return payload.category_companies;
        }
        if (Array.isArray(payload.items)) {
            return payload.items;
        }
        if (nestedData && Array.isArray(nestedData.results)) {
            return nestedData.results;
        }
        if (nestedData && Array.isArray(nestedData.category_companies)) {
            return nestedData.category_companies;
        }
    }

    return [];
};

export const getCategoryCompanies = async () => {
    try {
        const response = await axiosInstance.get('/category_companies/');
        const list = extractCategoryCompaniesArray(response.data).map((item, index) =>
            normalizeCategory(item, index),
        );

        return {
            raw: response.data,
            list,
        };
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return {
                raw: { local: true, reason: 'category-companies-endpoint-missing' },
                list: [...fallbackCategoryCompanies],
            };
        }
        throw error;
    }
};
