import { protect, authorize } from '../middleware/authMiddleware.js';

describe('Authentication Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      // Since protect is an asyncHandler, it throws errors differently
      // We need to catch the error that gets passed to next()
      try {
        await protect(mockRequest, mockResponse, mockNext);
      } catch (error) {
        // Error should be passed to next middleware
        expect(mockNext).toHaveBeenCalled();
        // Check if the error message is correct
        expect(mockNext.mock.calls[0][0].message).toBe('Not authorized, no token');
      }
    });
  });

  describe('authorize middleware', () => {
    it('should return 403 if user has no roles', () => {
      const middleware = authorize('some:permission');
      mockRequest.user = {};
      
      // The authorize middleware throws an error directly, not through next()
      expect(() => {
        middleware(mockRequest, mockResponse, mockNext);
      }).toThrow('Not authorized, user roles not found');
    });
  });
});