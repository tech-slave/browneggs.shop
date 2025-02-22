export const lockScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`; // Prevent layout shift
  };
  
  export const unlockScroll = () => {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  };