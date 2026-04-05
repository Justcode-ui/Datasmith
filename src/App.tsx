import React from 'react';
import { useDatasmithStore } from './store/datasmith';
import { Navbar } from './components/layout/Navbar';
import { ForgeScreen } from './screens/ForgeScreen';
import { SchemaScreen } from './screens/SchemaScreen';
import { CastingScreen } from './screens/CastingScreen';
import { OutputScreen } from './screens/OutputScreen';

const App: React.FC = () => {
  const { step } = useDatasmithStore();

  return (
    <div className="min-h-vh flex flex-col pt-16 selection:bg-[var(--color-accent)]/30 selection:text-[var(--color-text-primary)]">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center px-6">
        {step === 1 && <ForgeScreen />}
        {step === 2 && <SchemaScreen />}
        {step === 3 && <CastingScreen />}
        {step === 4 && <OutputScreen />}
      </main>

      {/* Decorative gradients */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-accent)]/5 blur-[120px] rounded-full -z-10 pointer-events-none translate-x-[-50%] translate-y-[-50%]" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-[var(--color-accent)]/3 blur-[100px] rounded-full -z-10 pointer-events-none translate-x-[20%] translate-y-[20%]" />
    </div>
  );
};

export default App;
