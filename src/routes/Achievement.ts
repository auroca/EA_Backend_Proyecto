import express from 'express';
import controller from '../controllers/Achievement';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: achievements
 *     description: Endpoints for user achievements
 *
 * components:
 *   schemas:
 *     Achievement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         code:
 *           type: string
 *           example: "FIVE_ROUTES"
 *         title:
 *           type: string
 *           example: "Explorador"
 *         description:
 *           type: string
 *           example: "Has subido 5 rutas."
 *         icon:
 *           type: string
 *           example: "🏔️"
 *         unlocked:
 *           type: boolean
 *           example: true
 *         unlockedAt:
 *           type: string
 *           nullable: true
 *           format: date-time
 *           example: "2026-03-13T09:00:00.000Z"
 */

/**
 * @openapi
 * /achievements/me:
 *   get:
 *     summary: Get current user achievements
 *     tags: [achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK. Returns all achievements with unlocked status.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logros obtenidos correctamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Achievement'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/me', authenticateToken, controller.getMyAchievements);

export default router;
