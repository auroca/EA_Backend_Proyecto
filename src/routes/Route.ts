import express from 'express';
import controller from '../controllers/Route';
import { Schemas, ValidateJoi, ValidateQuery } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
			 - in: query
				 name: filter
				 required: false
				 style: deepObject
				 explode: true
				 schema:
					 type: object
					 additionalProperties: true
				 description: |
					 Filter object using `filter[field]=value`. Strings perform substring (case-insensitive).
					 Numbers require exact match. For array fields (e.g. `tags`) a match occurs if any element contains the value.
					 Repeat `filter[field]` to OR multiple values for the same field. Combine different fields for AND.
				 examples:
					 byName:
						 summary: filter by name contains
						 value: { name: 'montaña' }
					 byDistance:
						 summary: exact numeric filter
						 value: { distance: 10 }
			 - in: query
				 name: limit
				 required: false
				 schema:
					 type: integer
					 enum: [10, 25, 50]
				 description: Page size. Use together with page to enable pagination.
			 - in: query
				 name: page
				 required: false
				 schema:
					 type: integer
					 minimum: 1
				 description: Page number. Use together with limit to enable pagination.
 *         description:
 *           type: string
 *           example: "Ruta circular con vistas muy buenas"
 *         city:
 *           type: string
 *           example: "Barcelona"
 *         country:
 *           type: string
 *           example: "España"
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
router.get('/', ValidateQuery(Schemas.Route.listQuery), controller.readAll);

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
router.put('/:routeId', ValidateJoi(Schemas.Route.update), controller.updateRoute);

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
router.delete('/:routeId', controller.deleteRoute);

export default router;