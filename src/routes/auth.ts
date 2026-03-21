import express from 'express';
import * as controller from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { Schemas, ValidateJoi } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: auth
 *     description: Authentication endpoints
 *
 * components:
 *   schemas:
 *     AuthLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: "juan@gmail.com"
 *         password:
 *           type: string
 *           example: "123456"
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user and return JWT
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLogin'
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Invalid credentials
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/login', ValidateJoi(Schemas.Auth.login), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Refresh token invalid or expired
 */
router.post('/refresh', controller.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/logout', controller.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get authenticated user profile
 *     tags: [auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/me', authenticateToken, controller.getMe);

export default router;