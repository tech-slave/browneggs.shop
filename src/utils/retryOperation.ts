const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const retryOperation = async (operation: () => Promise<any>, maxRetries = MAX_RETRIES) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
};