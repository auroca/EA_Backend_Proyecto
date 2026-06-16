import express from 'express';
import controller from '../controllers/Review';
import { Schemas, ValidateJoi } from '../middleware/Joi';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: reviews
 *     description: CRUD endpoints for Reviews
 *
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6787777"
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         userId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         title:
 *           type: string
 *           example: "Ruta molt recomanable"
 *         comment:
 *           type: string
 *           example: "M'han agradat molt les vistes"
 *         ratings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "clima"
 *               score:
 *                 type: number
 *                 example: 4
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-14T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-14T10:30:00.000Z"
 *
 *     ReviewCreate:
 *       type: object
 *       required:
 *         - routeId
 *         - title
 *         - ratings
 *       properties:
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         userId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789001"
 *         title:
 *           type: string
 *           example: "Ruta molt recomanable"
 *         comment:
 *           type: string
 *           example: "M'han agradat molt les vistes"
 *         ratings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "clima"
 *               score:
 *                 type: number
 *                 example: 4
 *
 *     ReviewUpdate:
 *       type: object
 *       properties:
 *         routeId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         title:
 *           type: string
 *           example: "Ruta espectacular"
 *         comment:
 *           type: string
 *           example: "La repetiria"
 *         ratings:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 example: "bonic"
 *               score:
 *                 type: number
 *                 example: 5
 */

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: List all Reviews
 *     tags: [reviews]
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
 *       - in: query
 *         name: routeId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter reviews by Route ObjectId.
 *     responses:
 *       200:
 *         description: OK. If limit and page are omitted, returns the full list.
 *       401:
 *         description: Unauthorized
 */
router.get('/', controller.readAll);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a Review by ID
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:reviewId', controller.readReview);

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a Review
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreate'
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
router.post('/', ValidateJoi(Schemas.Review.create), controller.createReview);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   put:
 *     summary: Update a Review by ID
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdate'
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
router.put('/:reviewId', ValidateJoi(Schemas.Review.update), controller.updateReview);

/**
 * @openapi
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a Review by ID
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ObjectId
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
router.delete('/:reviewId', controller.deleteReview);

export default router;
