const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);
    res.json(result);

  } catch (err) {
    handleError(err, res);
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await authService.register(
      name,
      email,
      password,
      role
    );

    res.status(201).json(user);

  } catch (err) {
    handleError(err, res);
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);
    res.json(result);

  } catch (err) {
    handleError(err, res);
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.json({ success: true });

  } catch (err) {
    handleError(err, res);
  }
};

const me = async (req, res) => {
  res.json(req.user);
};

function handleError(err, res) {
  const map = {
    INVALID_CREDENTIALS: 401,
    USER_INACTIVE: 403,
    EMAIL_EXISTS: 409,
    INVALID_REFRESH: 401,
    REFRESH_REVOKED: 401,
    USER_NOT_FOUND: 404
  };

  const status = map[err.message] || 500;

  res.status(status).json({
    message:
      status === 500
        ? 'Erro interno do servidor'
        : err.message
  });
}

module.exports = {
  login,
  register,
  refresh,
  logout,
  me
};
