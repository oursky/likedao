import React from 'react';
import AppRouter from './navigation/AppRouter'
import AppProviders from './providers/AppProviders';

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter/>
    </AppProviders>
  );
}

export default App;
