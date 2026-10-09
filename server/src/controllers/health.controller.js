export const checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Web Spy Server is up and running!',
    timestamp: new Date().toISOString(),
  });
};
