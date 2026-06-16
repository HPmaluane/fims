const svc = require('../services/locations.service');
const { successResponse, errorResponse } = require('../middlewares/response.middleware');

async function getAll(req, res, next) {
  try { return successResponse(res, await svc.getAll()); }
  catch (err) { next(err); }
}
async function getById(req, res, next) {
  try { return successResponse(res, await svc.getById(req.params.id)); }
  catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}
async function create(req, res, next) {
  try { return successResponse(res, await svc.create(req.body), 'Localização criada.', 201); }
  catch (err) { next(err); }
}
async function update(req, res, next) {
  try { return successResponse(res, await svc.update(req.params.id, req.body), 'Localização atualizada.'); }
  catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}
async function remove(req, res, next) {
  try { return successResponse(res, await svc.remove(req.params.id), 'Localização removida.'); }
  catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

module.exports = { getAll, getById, create, update, remove };
