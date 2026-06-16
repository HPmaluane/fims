const usersService = require('../services/users.service');
const { successResponse, errorResponse } = require('../middlewares/response.middleware');

async function getAll(req, res, next) {
  try {
    const { role, active } = req.query;
    const users = await usersService.getAll({
      role,
      active: active !== undefined ? active === 'true' : undefined,
    });
    return successResponse(res, users);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const user = await usersService.getById(req.params.id);
    return successResponse(res, user);
  } catch (err) {
    if (err.status) return errorResponse(res, err.message, err.status);
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const user = await usersService.update(req.params.id, req.body);
    return successResponse(res, user, 'Utilizador atualizado.');
  } catch (err) {
    if (err.status) return errorResponse(res, err.message, err.status);
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await usersService.remove(req.params.id);
    return successResponse(res, user, 'Utilizador desativado.');
  } catch (err) {
    if (err.status) return errorResponse(res, err.message, err.status);
    next(err);
  }
}

module.exports = { getAll, getById, update, remove };
