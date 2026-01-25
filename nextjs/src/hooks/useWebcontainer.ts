import { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { getWebContainer } from '@/lib/webcontainer';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer | null>(null);

  useEffect(() => {
    let mounted = true;

    getWebContainer().then(instance => {
      if (mounted) setWebcontainer(instance);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return webcontainer;
}
