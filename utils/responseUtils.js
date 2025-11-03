// file: utils/responseUtils.js
// Standar amplop sukses
export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

// Standar amplop error
export const errorResponse = (
  res,
  message = "Something went wrong",
  statusCode = 500
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    data: null,
  });
};
