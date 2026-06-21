import express from 'express';
import controller from '../controllers/Chat';
import { Schemas, ValidateJoi, ValidateQuery } from '../middleware/Joi';
import { authenticateToken, authorizeSelfOrAdmin, authorizeChatParticipantOrAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: chats
 *     description: CRUD endpoints for Chats
 *
 * components:
 *   schemas:
 *     ChatParticipant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         name:
 *           type: string
 *           example: "Judit"
 *         username:
 *           type: string
 *           example: "juud"
 *
 *     ChatMessage:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: "65f1c2a1b2c3d4e5f6789012"
 *         message:
 *           type: string
 *           example: "Hello everyone!"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2026-05-08T10:27:56.597Z"
 *
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "69fdba4a42d8ffb5ad2265f0"
 *         name:
 *           type: string
 *           example: "Trip1 Chat"
 *         participants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatParticipant'
 *         chatHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChatMessage'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-08T10:26:18.820Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-05-08T10:27:56.597Z"
 *
 *     ChatCreate:
 *       type: object
 *       required:
 *         - name
 *         - participants
 *       properties:
 *         name:
 *           type: string
 *           example: "Trip1 Chat"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           example: ["69fd7d4550d4da601027ea64", "65f000000000000000000001"]
 *         password:
 *           type: string
 *           nullable: true
 *           example: "secret123"
 *
 *     ChatUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Trip1 Chat Updated"
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           example: ["69fd7d4550d4da601027ea64", "65f000000000000000000001"]
 *         password:
 *           type: string
 *           nullable: true
 *           example: "secret123"
 *
 *     MessageCreate:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Hola!"
 *
 *     ChatJoin:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           example: "secret123"
 */

/**
 * @openapi
 * /chats:
 *   get:
 *     summary: List all Chats
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [10, 25, 50]
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: OK. Returns a list of chats.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, ValidateQuery(Schemas.Chat.listQuery), controller.readAll);

/**
 * @openapi
 * /chats:
 *   post:
 *     summary: Create a Chat
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, ValidateJoi(Schemas.Chat.create), controller.createChat);

/**
 * @openapi
 * /chats/user/{userId}:
 *   get:
 *     summary: List Chats by User
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ObjectId
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [10, 25, 50]
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: OK. Returns a list of chats where user participates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.get('/user/:userId', authenticateToken, authorizeSelfOrAdmin, ValidateQuery(Schemas.Chat.listQuery), controller.getChatsByUser);

/**
 * @openapi
 * /chats/{chatId}/join:
 *   post:
 *     summary: Join a Chat using its password
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatJoin'
 *     responses:
 *       200:
 *         description: Joined chat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Invalid password
 *       404:
 *         description: Chat not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/:chatId/join', authenticateToken, ValidateJoi(Schemas.Chat.join), controller.joinChat);

/**
 * @openapi
 * /chats/{chatId}:
 *   get:
 *     summary: Get a Chat by ID
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ObjectId
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.get('/:chatId', authenticateToken, authorizeChatParticipantOrAdmin, controller.readChat);

/**
 * @openapi
 * /chats/{chatId}:
 *   put:
 *     summary: Update a Chat by ID
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put('/:chatId', authenticateToken, authorizeChatParticipantOrAdmin, ValidateJoi(Schemas.Chat.update), controller.updateChat);

/**
 * @openapi
 * /chats/{chatId}:
 *   delete:
 *     summary: Delete a Chat by ID
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ObjectId
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:chatId', authenticateToken, authorizeChatParticipantOrAdmin, controller.deleteChat);

/**
 * @openapi
 * /chats/{chatId}/messages:
 *   post:
 *     summary: Add a Message to a Chat
 *     tags: [chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageCreate'
 *     responses:
 *       200:
 *         description: Message added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post('/:chatId/messages', authenticateToken, authorizeChatParticipantOrAdmin, ValidateJoi(Schemas.Chat.message), controller.addMessage);

router.post('/:chatId/read', authenticateToken, authorizeChatParticipantOrAdmin, controller.markChatRead);

export default router;
