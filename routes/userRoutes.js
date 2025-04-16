import express from 'express';

const router=express.Router();

router.get('/register', (req, res) => {
  // Logic for user registration
  res.status(201).json({ message: 'User registered successfully' });
});

export default router;