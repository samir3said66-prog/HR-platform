export interface UserPreferences {
  userId: string;
  language: 'en' | 'ar';
  darkMode: boolean;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  itemsPerPage: number;
  defaultDashboard: string;
  savedFilters: SavedFilter[];
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: string;
}

export interface FilterCriteria {
  department?: string;
  region?: string;
  employmentStatus?: string;
  performanceScoreMin?: number;
  performanceScoreMax?: number;
  hireDateFrom?: string;
  hireDateTo?: string;
}

export interface PreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

export const initialPreferencesState: PreferencesState = {
  preferences: null,
  loading: false,
  error: null,
};
