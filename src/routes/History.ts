import express from 'express';
import controller from '../controllers/History';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: history
 *     description: CRUD endpoints for History
 *
 * components:
 *   schemas:
 *     Change:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f678aaaa"
 *         historyId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f678bbbb"
 *         objectId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         fieldName:
 *           type: string
 *           example: "email"
 *         beforeValue:
 *           nullable: true
 *           example: "old@mail.com"
 *         afterValue:
 *           nullable: true
 *           example: "new@mail.com"
 *         changedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-14T12:00:00.000Z"
 *
 *     History:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f678bbbb"
 *         action:
 *           type: string
 *           enum: [CREATE, MODIFY, STATUS, DELETE]
 *           example: "MODIFY"
 *         entity:
 *           type: string
 *           enum: [USER, ROUTE, POINT]
 *           example: "USER"
 *         changes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Change'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-14T12:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-04-14T12:00:00.000Z"
 *
 *     HistoryCreate:
 *       type: object
 *       required:
 *         - action
 *         - entity
 *       properties:
 *         action:
 *           type: string
 *           enum: [CREATE, MODIFY, STATUS, DELETE]
 *           example: "CREATE"
 *         entity:
 *           type: string
 *           enum: [USER, ROUTE, POINT]
 *           example: "USER"
 *
 *     HistoryUpdate:
 *       type: object
 *       properties:
 *         action:
 *           type: string
 *           enum: [CREATE, MODIFY, STATUS, DELETE]
 *           example: "MODIFY"
 *         entity:
 *           type: string
 *           enum: [USER, ROUTE, POINT]
 *           example: "USER"
 */

/**
 * @openapi
 * /history:
 *   get:
 *     summary: List all history entries
 *     tags: [history]
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
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/History'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/History'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */

router.get('/', controller.readAllHistory);

/**
 * @openapi
 * /history/{historyId}:
 *   get:
 *     summary: Get a history entry by ID
 *     tags: [history]
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:historyId', controller.readHistory);

/**
 * @openapi
 * /history:
 *   post:
 *     summary: Create a history entry
 *     tags: [history]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoryCreate'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid data
 */
router.post('/', controller.createHistory);

/**
 * @openapi
 * /history/{historyId}:
 *   put:
 *     summary: Update a history entry by ID
 *     tags: [history]
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HistoryUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:historyId', controller.updateHistory);

/**
 * @openapi
 * /history/{historyId}:
 *   delete:
 *     summary: Delete a history entry by ID
 *     tags: [history]
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:historyId', controller.deleteHistory);

export default router;