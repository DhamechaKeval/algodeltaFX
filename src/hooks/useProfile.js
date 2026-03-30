import {useState, useEffect} from 'react';
import {getProfile} from '../services/profileService';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getProfile();
        setProfile(data?.data || data?.user || data?.profile || data);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return {profile, loading, error};
};