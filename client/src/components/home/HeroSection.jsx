import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [isVideoDone, setIsVideoDone] = useState(false);
  const videoRef = useRef(null);

  // Fallback in case the video can't play or end event fails
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isVideoDone) setIsVideoDone(true);
    }, 8000); // Max 8 seconds wait just in case
    return () => clearTimeout(timer);
  }, [isVideoDone]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-noir">
      
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          playsInline 
          onEnded={() => setIsVideoDone(true)}
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-80"
        >
          <source src="/Woman_walking_on_city_street_202605051557.mp4" type="video/mp4" />
        </video>
        {/* Very light overlay to allow video to be clear */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir/50 via-noir/10 to-noir/80 pointer-events-none" />
      </div>

      <div className="absolute inset-0 z-10 w-full max-w-[1800px] mx-auto px-4 md:px-12 flex justify-between items-center pointer-events-none overflow-hidden">
        
        {/* ELE sliding from left */}
        <motion.div
          initial={{ x: "-100vw", opacity: 0 }}
          animate={isVideoDone ? { x: 0, opacity: 1 } : { x: "-100vw", opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h1 className="text-[clamp(3.5rem,10vw,10rem)] font-display font-bold text-white tracking-normal drop-shadow-lg leading-none">ELE</h1>
        </motion.div>
        
        {/* SENE sliding from right */}
        <motion.div
          initial={{ x: "100vw", opacity: 0 }}
          animate={isVideoDone ? { x: 0, opacity: 1 } : { x: "100vw", opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h1 className="text-[clamp(3.5rem,10vw,10rem)] font-display font-bold text-white tracking-normal drop-shadow-lg leading-none">SENE</h1>
        </motion.div>
        
      </div>

      {/* Social Icons floating in the banner */}
      <div className="absolute bottom-12 right-8 md:right-16 z-20 flex gap-6 text-white/50">
        <a href="#" className="hover:text-white transition-colors duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
          </svg>
        </a>
        <a href="#" className="hover:text-white transition-colors duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a href="#" className="hover:text-white transition-colors duration-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.258 2.656 7.914 6.48 9.294-.09-.79-.17-2.006.036-2.868.188-.795 1.215-5.143 1.215-5.143s-.31-.621-.31-1.539c0-1.442.836-2.517 1.876-2.517.886 0 1.314.665 1.314 1.463 0 .891-.568 2.222-.86 3.456-.245 1.032.518 1.872 1.535 1.872 1.843 0 3.262-1.944 3.262-4.75 0-2.484-1.785-4.223-4.327-4.223-2.951 0-4.685 2.213-4.685 4.5 0 .892.343 1.85.772 2.373.085.103.097.195.07.306-.086.353-.28 1.14-.317 1.303-.049.213-.162.258-.382.155-1.427-.67-2.318-2.775-2.318-4.468 0-3.64 2.645-6.98 7.633-6.98 3.998 0 7.106 2.85 7.106 6.643 0 3.978-2.507 7.177-5.992 7.177-1.168 0-2.268-.607-2.643-1.325l-.718 2.733c-.26 1.002-.962 2.256-1.434 3.023A9.972 9.972 0 0012 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

    </section>
  );
};

export default HeroSection;
