
const httpCode = {
   SUCCESS: 200,
   BAD_REQUEST: 400,
   AUTH_ERROR: 401,
   NOT_FOUND: 404,
   INTERNAL_ERROR: 500
};

class HttpError extends Error {
   constructor(message, code = httpCode.BAD_REQUEST) {
      super(message);
      this.code = code;
   }
}

module.exports = {
   httpCode,
   HttpError
};
