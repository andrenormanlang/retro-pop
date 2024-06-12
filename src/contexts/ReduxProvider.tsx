'use client'; // This directive ensures the component is treated as a client component

import { Provider } from 'react-redux';
import { store } from '@/store/store';

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
