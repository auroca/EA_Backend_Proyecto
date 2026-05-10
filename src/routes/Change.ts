import express from 'express';
import controller from '../controllers/Change';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: changes
 *     description: CRUD endpoints for Change
 *
 * components:
 *   schemas:
 *     ChangeCreate:
 *       type: object
 *       required:
 *         - historyId
 *         - objectId
 *         - fieldName
 *       properties:
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
 *
 *     ChangeUpdate:
 *       type: object
 *       properties:
 *         historyId:
 *           type: string
 *         objectId:
 *           type: string
 *         fieldName:
 *           type: string
 *         beforeValue:
 *           nullable: true
 *         afterValue:
 *           nullable: true
 *         changedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /changes:
 *   get:
 *     summary: List all change entries
 *     tags: [changes]
 *     responses:
 *       200:
 *         description: OK
 *       500:
 *         description: Server error
 */
router.get('/', controller.readAllChanges);

/**
 * @openapi
 * /changes/{changeId}:
 *   get:
 *     summary: Get a change by ID
 *     tags: [changes]
 *     parameters:
 *       - in: path
 *         name: changeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:changeId', controller.readChange);

/**
 * @openapi
 * /changes:
 *   post:
 *     summary: Create a change
 *     tags: [changes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeCreate'
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid data
 */
router.post('/', controller.createChange);

/**
 * @openapi
 * /changes/{changeId}:
 *   put:
 *     summary: Update a change by ID
 *     tags: [changes]
 *     parameters:
 *       - in: path
 *         name: changeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
router.put('/:changeId', controller.updateChange);

/**
 * @openapi
 * /changes/{changeId}:
 *   delete:
 *     summary: Delete a change by ID
 *     tags: [changes]
 *     parameters:
 *       - in: path
 *         name: changeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:changeId', controller.deleteChange);

export default router;