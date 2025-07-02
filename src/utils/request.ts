import type { IResponse } from '@/types/IResponse';
import axios from 'axios';
import Toast from './Toast';

const request = axios.create({
    baseURL: '/api',
});

request.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

request.interceptors.response.use(
    (response) => {
        const data: IResponse<unknown> = response.data
        if (data.status === 500) {
            Toast.error(data.message)
            return Promise.reject(data.message);
        }

        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default request;