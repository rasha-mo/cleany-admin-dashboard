/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const initialOffers = [
    {
        id: 1,
        title: 'Summer Launch Promo',
        discount: 20,
        startDate: '2026-05-01',
        endDate: '2026-06-15',
        status: 'Active',
    },
    {
        id: 2,
        title: 'Clearance Boost',
        discount: 35,
        startDate: '2026-02-10',
        endDate: '2026-03-01',
        status: 'Expired',
    },
    {
        id: 3,
        title: 'Member Week',
        discount: 15,
        startDate: '2026-07-11',
        endDate: '2026-07-20',
        status: 'Active',
    },
    {
        id: 4,
        title: 'Flash Friday',
        discount: 10,
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        status: 'Active',
    },
];

let offersStore = [...initialOffers];

export const getOffers = async () => {
    return {
        list: [...offersStore],
    };
};

export const createOffer = async (payload) => {
    const next = {
        ...payload,
        id: offersStore.length ? Math.max(...offersStore.map((offer) => offer.id)) + 1 : 1,
    };
    offersStore = [...offersStore, next];
    return next;
};

export const updateOffer = async (id, payload) => {
    offersStore = offersStore.map((offer) => (offer.id === id ? { ...offer, ...payload, id } : offer));
};

export const deleteOffer = async (id) => {
    offersStore = offersStore.filter((offer) => offer.id !== id);
};

export const resetOffersStore = () => {
    offersStore = [...initialOffers];
};
