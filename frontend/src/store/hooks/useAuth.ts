/**
 * Custom hook for authentication
 */
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation, useRegisterMutation, useLogoutMutation, useGetCurrentUserQuery } from '../api/authApi';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction, updateUser } from '../slices/authSlice';
import { RootState } from '../index';
import { User } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const { data: currentUser, refetch: refetchUser } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const login = async (username: string, password: string) => {
    try {
      dispatch(loginStart());
      const result = await loginMutation({ username, password }).unwrap();
      dispatch(loginSuccess({ user: result.user, token: result.access_token }));
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.error || 'Login failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      dispatch(loginStart());
      const result = await registerMutation({ username, email, password }).unwrap();
      dispatch(loginSuccess({ user: result.user, token: result.access_token }));
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.error || 'Registration failed';
      dispatch(loginFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logoutAction());
    }
  };

  const updateUserData = (userData: Partial<User>) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    token,
    isAuthenticated,
    loading: loading || isLoggingIn || isRegistering,
    error,
    login,
    register,
    logout,
    updateUser: updateUserData,
    refetchUser,
    currentUser,
  };
};

