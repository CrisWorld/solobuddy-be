const axios = require('axios');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
// const { allowedOperators } = require('../utils/validate');
const { specialtyTypes, vehicleTypes, favourites, languages, countries } = require('../config/tour-guide');

const textOp = {
  operator: {
    type: 'string',
    enum: ['$regex'],
  },
  value: {
    type: 'string',
  },
};

const arrayOp = {
  operator: {
    type: 'string',
    enum: ['$in', '$nin', '$all'],
  },
  value: {
    type: 'array',
    items: {
      type: 'string',
    },
  },
};

const rangeOp = {
  operator: {
    type: 'string',
    enum: ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'],
  },
  value: {
    type: 'number',
  },
};

const generateConfig = {
  generationConfig: {
    response_mime_type: 'application/json',
    response_schema: {
      type: 'object',
      properties: {
        mongo_filter: {
          type: 'object',
          description: 'lọc dữ liệu tour guide',
          properties: {
            'user.name': {
              type: 'object',
              description: 'Tên hướng dẫn viên',
              properties: {
                ...textOp,
              },
            },
            location: {
              type: 'object',
              description: 'Vị trí của hướng dẫn viên',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: [
                      'vietnam',
                      'thailand',
                      'laos',
                      'cambodia',
                      'myanmar',
                      'singapore',
                      'malaysia',
                      'indonesia',
                      'philippines',
                    ],
                  },
                },
              },
            },
            'user.country': {
              type: 'object',
              description: 'Quốc gia của hướng dẫn viên',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: countries,
                  },
                },
              },
            },
            languages: {
              type: 'object',
              description: 'Ngôn ngữ mà hướng dẫn viên sử dụng',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: languages,
                  },
                },
              },
            },
            ratingAvg: {
              type: 'array',
              description: 'Đánh giá trung bình của hướng dẫn viên',
              items: {
                type: 'object',
                properties: {
                  ...rangeOp,
                },
              },
            },
            pricePerDay: {
              type: 'array',
              description: 'Giá mỗi ngày của hướng dẫn viên',
              items: {
                type: 'object',
                properties: {
                  ...rangeOp,
                },
              },
            },
            vehicle: {
              type: 'object',
              description: 'Phương tiện mà hướng dẫn viên sử dụng',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: vehicleTypes,
                  },
                },
              },
            },
            experienceYears: {
              type: 'object',
              description: 'Số năm kinh nghiệm của hướng dẫn viên',
              properties: {
                ...rangeOp,
              },
            },
            specialties: {
              type: 'object',
              description: 'Chuyên môn của hướng dẫn viên',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: specialtyTypes,
                  },
                },
              },
            },
            'favourites.name': {
              type: 'object',
              description: 'Sở thích của hướng dẫn viên',
              properties: {
                ...arrayOp,
                value: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: favourites,
                  },
                },
              },
            },
          },
        },
        response_text: {
          type: 'string',
          description: 'Văn bản trả lời bằng md (markdown) cho câu hỏi của người đi du lịch breakdown rõ ràng',
        },
      },
      required: ['response_text'],
    },
  },
};

const postAnswer = async function (messages) {
  try {
    const response = await axios.post(
      `${config.gemini.apiUrl}?key=${config.gemini.apiKey}`,
      {
        contents: messages.map((message) => ({
          role: message.role,
          parts: message.parts.map((part) => ({ text: part.text })),
        })),
        ...generateConfig,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    // Gọi AppError nếu cần xử lý lỗi tùy chỉnh
    const status = (error.response && error.response.status) || 500;
    const message =
      (error.response && error.response.data && error.response.data.error && error.response.data.error.message) ||
      error.message;
    throw new ApiError(status, 'AI service error: '.concat(message));
  }
};

module.exports = { postAnswer };
