const { Router } = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/response.middleware');

const authCtrl        = require('../controllers/auth.controller');
const usersCtrl       = require('../controllers/users.controller');
const locationsCtrl   = require('../controllers/locations.controller');
const inspectionsCtrl = require('../controllers/inspections.controller');
const templatesCtrl   = require('../controllers/templates.controller');

const router = Router();

// ─── AUTH ────────────────────────────────────────────────────
router.post('/auth/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  authCtrl.login
);

router.post('/auth/register',
  authenticate, authorize('admin'),
  [
    body('name').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'ceo', 'supervisor', 'inspector']),
  ],
  validateRequest,
  authCtrl.register
);

router.post('/auth/refresh',
  [body('refreshToken').notEmpty()],
  validateRequest,
  authCtrl.refresh
);

router.post('/auth/logout', authenticate, authCtrl.logout);
router.get('/auth/me',      authenticate, authCtrl.me);

// ─── USERS ──────────────────────────────────────────────────
router.get('/users',       authenticate, authorize('admin', 'ceo', 'supervisor'), usersCtrl.getAll);
router.get('/users/:id',   authenticate, usersCtrl.getById);
router.put('/users/:id',   authenticate, authorize('admin'), usersCtrl.update);
router.delete('/users/:id',authenticate, authorize('admin'), usersCtrl.remove);

// ─── LOCATIONS ──────────────────────────────────────────────
router.get('/locations',        authenticate, locationsCtrl.getAll);
router.get('/locations/:id',    authenticate, locationsCtrl.getById);
router.post('/locations',       authenticate, authorize('admin', 'supervisor'),
  [body('name').notEmpty().trim()], validateRequest,
  locationsCtrl.create
);
router.put('/locations/:id',    authenticate, authorize('admin', 'supervisor'), locationsCtrl.update);
router.delete('/locations/:id', authenticate, authorize('admin'), locationsCtrl.remove);

// ─── INSPECTIONS ────────────────────────────────────────────
router.get('/inspections',      authenticate, inspectionsCtrl.getAll);
router.get('/dashboard',        authenticate, authorize('admin', 'ceo', 'supervisor'), inspectionsCtrl.getDashboard);
router.get('/inspections/:id',  authenticate, inspectionsCtrl.getById);
router.post('/inspections',     authenticate,
  [
    body('location_id').isUUID(),
    body('inspection_date').optional().isDate(),
  ],
  validateRequest,
  inspectionsCtrl.create
);
router.patch('/inspections/:id/items',   authenticate, inspectionsCtrl.updateItems);
router.patch('/inspections/:id/submit',  authenticate, inspectionsCtrl.submit);
router.patch('/inspections/:id/review',  authenticate, authorize('admin', 'ceo', 'supervisor'), inspectionsCtrl.review);
router.patch('/inspections/:id/close',   authenticate, authorize('admin', 'ceo', 'supervisor'), inspectionsCtrl.close);
router.delete('/inspections/:id',        authenticate, authorize('admin'), inspectionsCtrl.remove);

// ─── TEMPLATES ──────────────────────────────────────────────
router.get('/templates',   authenticate, templatesCtrl.getSections);
router.get('/audit-logs',  authenticate, authorize('admin', 'ceo'), templatesCtrl.getAuditLogs);

module.exports = router;
