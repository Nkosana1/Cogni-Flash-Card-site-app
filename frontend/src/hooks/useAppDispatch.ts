/**
 * Typed dispatch hook
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();

