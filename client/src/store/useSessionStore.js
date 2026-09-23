import { create } from 'zustand';

const getOrCreateSession = () => {
  let id = localStorage.getItem('playrush_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('playrush_session_id', id);
  }
  return id;
};

export const useSessionStore = create((set) => ({
  sessionId: getOrCreateSession(),
  locationGranted: false,
  locationChecked: false,
  locationData: null,

  setLocationGranted: (data) =>
    set({ locationGranted: true, locationChecked: true, locationData: data }),
  setLocationDenied: () =>
    set({ locationGranted: false, locationChecked: true }),
}));
