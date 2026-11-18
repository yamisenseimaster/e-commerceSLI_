import { useEffect } from 'react';
import { useLocation } from 'react-router';
const DesplazarAlInicio = propiedades => {
  const ubicacion = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ubicacion]);
  return <>{propiedades.children}</>;
};
export default DesplazarAlInicio;
