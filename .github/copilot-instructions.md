# Copilot Instructions for solobuddy-be

## Project Overview
- **Type:** Node.js RESTful API server using Express and Mongoose (MongoDB)
- **Structure:** Follows a layered architecture: routes → controllers → services → models
- **Purpose:** Provides authentication, user management, and related features for a travel/booking platform.

## Key Directories & Files
- `src/config/`: App configuration, environment, logger, roles, tokens, etc.
- `src/controllers/`: Route controllers (business logic entrypoints)
- `src/services/`: Business logic, called by controllers
- `src/models/`: Mongoose schemas and plugins (`toJSON`, `paginate`)
- `src/routes/`: Route definitions, grouped by version (e.g., `v1/`)
- `src/middlewares/`: Express middlewares (auth, error, validation, etc.)
- `src/validations/`: Joi schemas for request validation
- `src/utils/`: Utilities (error handling, async wrappers)
- `src/docs/`: Swagger/OpenAPI docs

## Developer Workflows
- **Run dev server:** `yarn dev`
- **Run tests:** `yarn test` (unit/integration in `tests/`)
- **Lint/fix:** `yarn lint` / `yarn lint:fix`
- **Format:** `yarn prettier` / `yarn prettier:fix`
- **Docker:** `yarn docker:dev` / `yarn docker:prod`
- **API docs:** Visit `/v1/docs` when server is running

## Patterns & Conventions
- **Controllers:** Always async, wrapped with `catchAsync` for error forwarding
- **Error Handling:** Use `ApiError` for custom errors; errors bubble to centralized middleware
- **Validation:** Use `validate` middleware with Joi schemas from `src/validations/`
- **Authentication:** Use `auth` middleware; JWT-based, roles/permissions in `src/config/roles.js`
- **Logging:** Use `logger` from `src/config/logger.js` (Winston)
- **Mongoose Plugins:** Use `toJSON` and `paginate` plugins for models
- **Testing:** Fixtures in `tests/fixtures/`, setup in `tests/utils/setupTestDB.js`
- **Environment:** Configured via `.env` (see `.env.example`)

## Integration Points
- **MongoDB:** Main data store, configured in `.env`
- **Email:** SMTP config in `.env`, used by `email.service.js`
- **Swagger:** API docs auto-generated from route comments
- **PM2:** Used for production process management

## Notable Customizations
- **Role-based permissions:** See `src/config/roles.js` for mapping
- **Custom plugins:** `src/models/plugins/` for model enhancements
- **Centralized error/validation/logging patterns**

## Examples
- **Add a new route:**
  - Define validation in `src/validations/`
  - Add controller logic in `src/controllers/`
  - Add service logic in `src/services/` (if needed)
  - Register route in `src/routes/v1/`
- **Add a new model:**
  - Define schema in `src/models/`, use plugins as needed

## References
- See `README.md` for full documentation and workflow details
- See `CONTRIBUTING.md` for contribution guidelines

---

**Keep instructions up to date with project-specific conventions.**
