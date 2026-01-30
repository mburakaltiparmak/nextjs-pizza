import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="bg-red min-h-screen flex flex-col items-center justify-center">
      <div className="text-yellow text-4xl font-Satisfy mb-4">lezzetin burada</div>
      <Loader2 className="h-16 w-16 animate-spin text-yellow" />
      <p className="text-lightgray mt-4 text-xl font-Barlow">yükleniyor...</p>
    </div>
  );
};

export default Loading;