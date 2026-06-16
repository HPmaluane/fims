const { validationResult } = require('express-validator');

/**
 * Standard success response
 */
function successResponse(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Standard error response
 */
function errorResponse(res, message, statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Middleware: validate express-validator results
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Dados inválidos.', 422, errors.array());
  }
  next();
}

/**
 * Global error handler (mount last in Express)
 */
function globalErrorHandler(err, req, res, _next) {
  console.error('[Global Error]', err);

  if (err.code === '23505') {
    // PostgreSQL unique violation
    return errorResponse(res, 'Registo duplicado. Verifique os dados.', 409);
  }
  if (err.code === '23503') {
    return errorResponse(res, 'Referência inválida. Entidade relacionada não encontrada.', 400);
  }

  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Erro interno do servidor.' : err.message;
  return errorResponse(res, message, status);
}

/**
 * 404 handler
 */
function notFoundHandler(req, res) {
  return errorResponse(res, `Rota não encontrada: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = {
  successResponse,
  errorResponse,
  validateRequest,
  globalErrorHandler,
  notFoundHandler,
};
