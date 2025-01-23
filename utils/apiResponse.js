exports.successResponse = function (res, msg) {
  const data = {
    status: true,
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
  const resData = {
    status: true,
    message: msg,
    results: data.length,
    data: data,
  };
  return res.status(200).json(resData);
};

exports.ErrorResponse = function (res, msg) {
  const data = {
    status: false,
    message: msg,
  };
  return res.status(500).json(data);
};

exports.notFoundResponse = function (res, msg) {
  const data = {
    status: false,
    message: msg,
  };
  return res.status(404).json(data);
};

exports.notAllowedResponse = function (res, msg) {
  const data = {
    status: false,
    message: msg,
  };
  return res.status(405).json(data);
};

exports.validationError = function (res, msg) {
  const resData = {
    status: false,
    message: msg,
  };
  return res.status(400).json(resData);
};

exports.userExistsError = function (res, msg) {
  const resData = {
    status: false,
    message: msg,
  };
  return res.status(409).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
  const data = {
    status: false,
    message: msg,
  };
  return res.status(401).json(data);
};

exports.tokenNotFoundResponse = function (res, msg) {
  const data = {
    status: false,
    message: msg,
  };
  return res.status(422).json(data);
};
