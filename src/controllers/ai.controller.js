const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/ai.service');
const { queryTourGuides } = require('../services/tour-guide.service');
/**
 * POST /v1/ai/answer
 * Body: { messages: [...] }
 * Returns: AI response (json)
 */
const getAIResponse = catchAsync(async (req, res) => {
  const { messages } = req.body;
  const messagesMapping = messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
  if (!messagesMapping || !Array.isArray(messagesMapping)) {
    return res.status(httpStatus.BAD_REQUEST).send({ message: 'messages is required and must be an array' });
  }
  const aiResponse = await aiService.postAnswer(messagesMapping);
  const response = JSON.parse(aiResponse.candidates[0].content.parts[0].text);
  const filter = {};
  Object.keys(response.mongo_filter || {}).forEach((key) => {
    filter[key] = {
      [response.mongo_filter[key].operator]: response.mongo_filter[key].value,
    };
  });
  if (response.isNeededFindTourGuides) {
    const guides = await queryTourGuides(filter, {});
    res.status(httpStatus.OK).send({ response, guides });
  } else {
    res.status(httpStatus.OK).send({ response, guides: [] });
  }
});

module.exports = {
  getAIResponse,
};
