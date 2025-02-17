import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = () => {
    // First blast from bottom
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 1 },
      colors: ['#F59E0B', '#D97706', '#92400E']
    });

    // Then from the sides
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F59E0B', '#D97706', '#92400E']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F59E0B', '#D97706', '#92400E']
      });
    }, 250);
  };

  return { triggerConfetti };
};