import dotenv from 'dotenv';
dotenv.config();
import { generateAccessToken, generateRefreshToken } from './utils/generateToken.js';

console.log('Token generation module loaded successfully');
console.log('Access Token:', generateAccessToken('123'));
console.log('Refresh Token:', generateRefreshToken('123'));
