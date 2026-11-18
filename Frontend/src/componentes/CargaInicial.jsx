import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usarAjustesTema } from '../Contextos/ContextoTema';
const CLAVE = 'replayInitialLoaderSeen';
const puntos = Array.from({
  length: 18
});
function CargaInicial() {
  const {
    theme: tema
  } = usarAjustesTema();
  const [visible, establecerVisible] = useState(() => !sessionStorage.getItem(CLAVE));
  const esOscuro = tema.mode === 'dark';
  useEffect(() => {
    if (!visible) return undefined;
    const temporizador = window.setTimeout(() => {
      sessionStorage.setItem(CLAVE, 'true');
      establecerVisible(false);
    }, 1800);
    return () => window.clearTimeout(temporizador);
  }, [visible]);
  return <AnimatePresence>
      {visible && <motion.div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden" initial={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} transition={{
      duration: 0.45,
      ease: 'easeOut'
    }} style={{
      background: esOscuro ? 'radial-gradient(circle at 50% 42%, rgba(0, 200, 147, 0.22), rgba(17, 24, 39, 0.94) 46%, rgba(7, 8, 10, 0.98) 100%)' : 'radial-gradient(circle at 50% 42%, rgba(0, 200, 147, 0.18), rgba(247, 244, 239, 0.94) 48%, rgba(255, 255, 255, 0.98) 100%)'
    }}>
        
          <motion.div className="relative flex h-64 w-64 items-center justify-center rounded-full" initial={{
        scale: 0.92
      }} animate={{
        scale: [0.92, 1, 0.96]
      }} transition={{
        duration: 1.8,
        ease: 'easeInOut',
        repeat: Infinity
      }}>
          
            <motion.div className="absolute inset-6 rounded-full border border-white/20 bg-white/20 shadow-[0_28px_80px_rgba(0,0,0,0.16)] backdrop-blur-2xl dark:bg-white/[0.07]" animate={{
          rotate: 360
        }} transition={{
          duration: 5,
          ease: 'linear',
          repeat: Infinity
        }} />
          
            {puntos.map((_, indice) => {
          const angulo = indice * 22;
          const distancia = 18 + indice * 4.2;
          return <motion.span key={indice} className="absolute h-3 w-3 rounded-full bg-main shadow-[0_0_22px_rgba(0,200,147,0.6)]" style={{
            transform: `rotate(${angulo}deg) translateX(${distancia}px)`,
            opacity: 1 - indice * 0.035
          }} animate={{
            rotate: [angulo, angulo + 360],
            scale: [0.75, 1.18, 0.75]
          }} transition={{
            duration: 1.65,
            delay: indice * 0.025,
            ease: 'easeInOut',
            repeat: Infinity
          }} />;
        })}
            <motion.div className="relative z-10 text-center" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }}>
            
              <p className="text-[31px] font-black leading-none text-[#111827] dark:text-white">
                Re<span className="text-main">Play</span>
              </p>
              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#667085] dark:text-[#cbd5e1]">
                Cargando tienda
              </p>
            </motion.div>
          </motion.div>
        </motion.div>}
    </AnimatePresence>;
}
export default CargaInicial;
