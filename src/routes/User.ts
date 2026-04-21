import express from 'express';
import controller from '../controllers/User';
import { Schemas, ValidateJoi, ValidateQuery } from '../middleware/Joi';
import { authenticateToken, authorizeRoles, authorizeSelfOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: users
 *     description: CRUD endpoints for Users
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Judit"
 *         surname:
 *           type: string
 *           example: "Martinez"
 *         username:
 *           type: string
 *           example: "judit99"
 *         email:
 *           type: string
 *           example: "judit@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         enabled:
 *           type: boolean
 *           example: true
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "user"
 *         favoriteRoutes:
 *           type: array
 *           items:
 *             type: string
 *           example: ["65f1c2a1b2c3d4e5f6789012", "65f1c2a1b2c3d4e5f6789013"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-07T14:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-07T15:00:00.000Z"
 *
 *     UserCreate:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - username
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Judit"
 *         surname:
 *           type: string
 *           example: "Martinez"
 *         username:
 *           type: string
 *           example: "judit99"
 *         email:
 *           type: string
 *           example: "judit@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Judit"
 *         surname:
 *           type: string
 *           example: "Martinez"
 *         username:
 *           type: string
 *           example: "judit99"
 *         email:
 *           type: string
 *           example: "judit@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         enabled:
 *           type: boolean
 *           example: true
 *         role:
 *           type: string
 *           enum: [admin, user]
 *           example: "admin"
 *
 *     FavoriteRoutes:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Route'
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a User
 *     tags: [users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 */
router.post('/', ValidateJoi(Schemas.User.create), controller.createUser);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all Users
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [10, 25, 50]
 *         description: Page size. Use together with page to enable pagination.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number. Use together with limit to enable pagination.
 *     responses:
 *       200:
 *         description: OK. If limit and page are omitted, returns the full list.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticateToken, authorizeRoles('admin'), ValidateQuery(Schemas.User.listQuery), controller.readAll);

/**
 * @openapi
 * /users/{userId}/favorites:
 *   get:
 *     summary: Get favorite Routes of a User
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteRoutes'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:userId/favorites', authenticateToken, authorizeSelfOrAdmin, controller.readFavorites);

/**
 * @openapi
 * /users/{userId}/favorites/{routeId}:
 *   post:
 *     summary: Add a Route to User favorites
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ObjectId
 *     responses:
 *       200:
 *         description: Favorite added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteRoutes'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/:userId/favorites/:routeId', authenticateToken, authorizeSelfOrAdmin, controller.addFavorite);

/**
 * @openapi
 * /users/{userId}/favorites/{routeId}:
 *   delete:
 *     summary: Remove a Route from User favorites
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ObjectId
 *     responses:
 *       200:
 *         description: Favorite removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteRoutes'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:userId/favorites/:routeId', authenticateToken, authorizeSelfOrAdmin, controller.removeFavorite);

/**
 * @openapi
 * /users/{userId}/favorites/{routeId}/toggle:
 *   patch:
 *     summary: Toggle a Route in User favorites
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ObjectId
 *     responses:
 *       200:
 *         description: Favorite toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FavoriteRoutes'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.patch('/:userId/favorites/:routeId/toggle', authenticateToken, authorizeSelfOrAdmin, controller.toggleFavorite);

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     summary: Get a User by ID
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/:userId', authenticateToken, authorizeSelfOrAdmin, controller.readUser);

/**
 * @openapi
 * /users/{userId}:
 *   put:
 *     summary: Update a User by ID
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed (Joi)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:userId', authenticateToken, authorizeSelfOrAdmin, ValidateJoi(Schemas.User.update), controller.updateUser);

/**
 * @openapi
 * /users/{userId}:
 *   delete:
 *     summary: Delete a User by ID
 *     tags: [users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:userId', authenticateToken, authorizeSelfOrAdmin, controller.deleteUser);

export default router;