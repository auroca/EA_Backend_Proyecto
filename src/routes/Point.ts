import express from 'express';
import controller from '../controllers/Point';
import { Schemas, ValidateJoi, ValidateQuery } from '../middleware/Joi';
import { authenticateToken, authorizePointRouteOwnerOrAdmin, authorizePointOwnerOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: points
 *     description: CRUD endpoints for Points
 *
 * components:
 *   schemas:
 *     Point:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789999"
 *         name:
 *           type: string
 *           example: "Mirador principal"
 *         description:
 *           type: string
 *           example: "Punto con vistas panorámicas"
 *         latitude:
 *           type: number
 *           example: 41.5932
 *         longitude:
 *           type: number
 *           example: 1.8371
 *         image:
 *           type: string
 *           example: "https://miapp.com/point.jpg"
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         index:
 *           type: number
 *           example: 0
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-13T09:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-13T09:30:00.000Z"
 *
 *     PointCreate:
 *       type: object
 *       required:
 *         - name
 *         - latitude
 *         - longitude
 *         - routeId
 *         - index
 *       properties:
 *         name:
 *           type: string
 *           example: "Mirador principal"
 *         description:
 *           type: string
 *           example: "Punto con vistas panorámicas"
 *         latitude:
 *           type: number
 *           example: 41.5932
 *         longitude:
 *           type: number
 *           example: 1.8371
 *         image:
 *           type: string
 *           example: "https://miapp.com/point.jpg"
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         index:
 *           type: number
 *           example: 0
 *
 *     PointUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Mirador secundario"
 *         description:
 *           type: string
 *           example: "Otro punto interesante"
 *         latitude:
 *           type: number
 *           example: 41.6001
 *         longitude:
 *           type: number
 *           example: 1.8405
 *         image:
 *           type: string
 *           example: "https://miapp.com/point2.jpg"
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         index:
 *           type: number
 *           example: 1
 */

/**
 * @openapi
 * /points:
 *   get:
 *     summary: List all Points
 *     tags: [points]
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
 */
router.get('/', authenticateToken, ValidateQuery(Schemas.Point.listQuery), controller.readAll);

/**
 * @openapi
 * /points/route/{routeId}:
 *   get:
 *     summary: List all Points for a Route
 *     tags: [points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 */
router.get('/route/:routeId', authenticateToken, controller.readByRoute);

/**
 * @openapi
 * /points/{pointId}:
 *   get:
 *     summary: Get a Point by ID
 *     tags: [points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Point ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:pointId', authenticateToken, controller.readPoint);

/**
 * @openapi
 * /points:
 *   post:
 *     summary: Create a Point
 *     tags: [points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointCreate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, authorizePointRouteOwnerOrAdmin, ValidateJoi(Schemas.Point.create), controller.createPoint);

/**
 * @openapi
 * /points/{pointId}:
 *   put:
 *     summary: Update a Point by ID
 *     tags: [points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Point ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PointUpdate'
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
router.put('/:pointId', authenticateToken, authorizePointOwnerOrAdmin, ValidateJoi(Schemas.Point.update), controller.updatePoint);

/**
 * @openapi
 * /points/{pointId}:
 *   delete:
 *     summary: Delete a Point by ID
 *     tags: [points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Point ObjectId
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
router.delete('/:pointId', authenticateToken, authorizePointOwnerOrAdmin, controller.deletePoint);

export default router;
