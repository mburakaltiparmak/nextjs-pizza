"use client";

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboard } from '@/lib/store/actions/adminActions';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // Problem #2: Less aggressive backoff

export function useDashboardDataLoader() {
    const dispatch = useDispatch();
    // Using refs to prevent closing over stale values in setTimeout
    const retryCountRef = useRef(0);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        const loadData = async () => {
            try {
                // Optimized parallel fetch is handled in the action
                await dispatch(fetchDashboard());
                retryCountRef.current = 0; // Reset retry on success
            } catch (error) {
                if (retryCountRef.current < MAX_RETRIES && isMountedRef.current) {
                    retryCountRef.current++;
                    const delay = INITIAL_RETRY_DELAY * retryCountRef.current; // Linear backoff

                    console.warn(`Dashboard load failed, retrying in ${delay}ms... (Attempt ${retryCountRef.current}/${MAX_RETRIES})`);

                    setTimeout(() => {
                        if (isMountedRef.current) {
                            loadData();
                        }
                    }, delay);
                }
            }
        };

        loadData();

        return () => {
            isMountedRef.current = false;
        };
    }, [dispatch]);
}
