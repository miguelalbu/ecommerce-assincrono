import { Request, Response, NextFunction } from 'express';
import { adminMiddleware } from '../../src/middleware/admin.middleware';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
  customerId?: string;
}

interface RequestWithUser extends Request {
  user?: UserPayload;
}

describe('Admin Middleware', () => {
  let mockRequest: Partial<RequestWithUser>; 
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    // Limpa os mocks antes de cada teste
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('deve chamar next() se o usuário for ADMIN', () => {
    mockRequest.user = { role: 'ADMIN', userId: '1', email: 'admin@test.com' };
    adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('deve retornar erro 403 se o usuário NÃO for ADMIN', () => {
    mockRequest.user = { role: 'USER', userId: '2', email: 'user@test.com' };
    adminMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });
});