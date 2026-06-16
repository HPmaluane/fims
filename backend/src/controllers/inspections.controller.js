const svc = require('../services/inspections.service');
const { successResponse, errorResponse } = require('../middlewares/response.middleware');
const { writeAudit } = require('../middlewares/audit.middleware');

async function getAll(req, res, next) {
  try {
    const { inspector_id, location_id, status, from, to } = req.query;
    const data = await svc.getAll({
      inspector_id, location_id, status, from, to,
      role: req.user.role, userId: req.user.id,
    });
    return successResponse(res, data);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const data = await svc.getById(req.params.id);
    return successResponse(res, data);
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function create(req, res, next) {
  try {
    const data = await svc.create({
      ...req.body,
      inspector_id: req.body.inspector_id || req.user.id,
    });
    await writeAudit({
      userId: req.user.id, userName: req.user.name,
      action: 'CREATE_INSPECTION',
      detail: `Inspeção criada: ${data.location_name}`,
      entityType: 'inspection', entityId: data.id, ipAddress: req.ip,
    });
    return successResponse(res, data, 'Inspeção criada.', 201);
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function updateItems(req, res, next) {
  try {
    const data = await svc.updateItems(req.params.id, req.body.items);
    return successResponse(res, data, 'Itens atualizados.');
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function submit(req, res, next) {
  try {
    const data = await svc.submit(req.params.id, req.body);
    await writeAudit({
      userId: req.user.id, userName: req.user.name,
      action: 'SUBMIT_INSPECTION',
      detail: `Inspeção submetida: ${req.params.id}`,
      entityType: 'inspection', entityId: req.params.id, ipAddress: req.ip,
    });
    return successResponse(res, data, 'Inspeção submetida com sucesso.');
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function review(req, res, next) {
  try {
    const data = await svc.review(req.params.id, req.body);
    await writeAudit({
      userId: req.user.id, userName: req.user.name,
      action: 'REVIEW_INSPECTION', detail: `Inspeção revisada: ${req.params.id}`,
      entityType: 'inspection', entityId: req.params.id, ipAddress: req.ip,
    });
    return successResponse(res, data, 'Inspeção revisada.');
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function close(req, res, next) {
  try {
    const data = await svc.close(req.params.id);
    return successResponse(res, data, 'Inspeção fechada.');
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function remove(req, res, next) {
  try {
    await svc.remove(req.params.id);
    return successResponse(res, null, 'Inspeção eliminada.');
  } catch (err) { if (err.status) return errorResponse(res, err.message, err.status); next(err); }
}

async function getDashboard(req, res, next) {
  try {
    const data = await svc.getDashboardStats();
    return successResponse(res, data);
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, updateItems, submit, review, close, remove, getDashboard };
