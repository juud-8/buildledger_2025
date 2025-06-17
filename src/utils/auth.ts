import { NavigateFunction } from 'react-router-dom';
import supabase from './supabase';

export async function handleLogout(navigate: NavigateFunction) {
  await supabase.auth.signOut();
  navigate('/login');
}
