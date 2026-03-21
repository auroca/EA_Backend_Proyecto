import express from 'express';
import controller from '../controllers/Route';
import { Schemas, ValidateJoi } from '../middleware/Joi';
import { authenticateToken, authorizeRouteOwnerOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: routes
 *     description: CRUD endpoints for Routes
 *
 * components:
 *   schemas:
 *     Route:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Ruta por Montserrat"
 *         description:
 *           type: string
 *           example: "Ruta circular con vistas muy buenas"
 *         city:
 *           type: string
 *           example: "Barcelona"
 *         country:
 *           type: string
 *           example: "España"
 *         distance:
 *           type: number
 *           example: 12.5
 *         duration:
 *           type: number
 *           example: 180
 *         difficulty:
 *           type: string
 *           example: "medium"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["montaña", "naturaleza"]
 *         userId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-13T09:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-03-13T09:30:00.000Z"
 *
 *     RouteCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - city
 *         - country
 *         - distance
 *         - duration
 *         - difficulty
 *       properties:
 *         name:
 *           type: string
 *           example: "Ruta por Montserrat"
 *         description:
 *           type: string
 *           example: "Ruta circular con vistas muy buenas"
 *         city:
 *           type: string
 *           example: "Barcelona"
 *         country:
 *           type: string
 *           example: "España"
 *         distance:
 *           type: number
 *           example: 12.5
 *         duration:
 *           type: number
 *           example: 180
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: "medium"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["montaña", "naturaleza"]
 *
 *     RouteUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Ruta por Montserrat"
 *         description:
 *           type: string
 *           example: "Ruta circular con vistas muy buenas"
 *         city:
 *           type: string
 *           example: "Barcelona"
 *         country:
 *           type: string
 *           example: "España"
 *         distance:
 *           type: number
 *           example: 12.5
 *         duration:
 *           type: number
 *           example: 180
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           example: "hard"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["montaña", "naturaleza"]
 */

router.use(authenticateToken);

/**
 * @openapi
 * /routes:
 *   get:
 *     summary: List all Routes
 *     tags: [routes]
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
router.get('/', controller.readAll);

/**
 * @openapi
 * /routes/{routeId}:
 *   get:
 *     summary: Get a Route by ID
 *     tags: [routes]
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
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:routeId', controller.readRoute);

/**
 * @openapi
 * /routes:
 *   post:
 *     summary: Create a Route
 *     tags: [routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteCreate'
 *     responses:
 *       201:
 *         description: Created
 *       422:
 *         description: Validation failed (Joi)
 *       401:
 *         description: Unauthorized
 */
router.post('/', ValidateJoi(Schemas.Route.create), controller.createRoute);

/**
 * @openapi
 * /routes/{routeId}:
 *   put:
 *     summary: Update a Route by ID
 *     tags: [routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Route ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RouteUpdate'
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
router.put('/:routeId', authorizeRouteOwnerOrAdmin, ValidateJoi(Schemas.Route.update), controller.updateRoute);

/**
 * @openapi
 * /routes/{routeId}:
 *   delete:
 *     summary: Delete a Route by ID
 *     tags: [routes]
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
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:routeId', authorizeRouteOwnerOrAdmin, controller.deleteRoute);

export default router;