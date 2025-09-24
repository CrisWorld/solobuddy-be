const express = require('express');
const aiController = require('../../controllers/ai.controller');

const router = express.Router();

/**
 * @swagger
 * /ai/answer:
 *   post:
 *     summary: Lấy response từ AI
 *     description: Nhận messages và trả về response từ AI (ví dụ Gemini, GPT...)
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Danh sách message gửi tới AI
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       example: user
 *                     text:
 *                       type: string
 *                       example: "Tôi muốn tìm hướng dẫn viên biết tiếng Anh ở Đà Nẵng."
 *           example:
 *             messages:
 *               - role: user
 *                 text: "Tôi muốn tìm hướng dẫn viên biết tiếng Anh ở Đà Nẵng."
 *     responses:
 *       200:
 *         description: Kết quả trả về từ AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mongo_filter:
 *                   type: object
 *                   description: Filter để truy vấn tour guide
 *                 response_text:
 *                   type: string
 *                   description: Trả lời dạng markdown
 *       400:
 *         description: Lỗi request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.post('/answer', aiController.getAIResponse);

module.exports = router;
