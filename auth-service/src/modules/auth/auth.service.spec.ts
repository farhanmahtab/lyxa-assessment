import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.model';
import { PasswordHasher } from '../../common/utils/password-hasher.util';

describe('AuthService', () => {
  let service: AuthService;
  let model: any;
  let jwtService: JwtService;
  let clientProxy: any;

  const mockUser = {
    _id: 'user_id',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashed_password',
    role: 'user',
  };

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
    verify: jest.fn(),
  };

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    model = module.get(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
    clientProxy = module.get('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      
      const saveSpy = jest.fn().mockResolvedValue(mockUser);
      // Mocking the constructor by mocking the model as a constructor
      function mockModelInstance(dto) {
        this.email = dto.email;
        this.password = dto.password;
        this.name = dto.name;
        this._id = mockUser._id;
        this.save = saveSpy;
      }
      
      // This is a bit tricky with NestJS InjectModel and plain jest mocks.
      // Another way: mock the prototype or just the model function if it's used as a constructor.
      // But in auth.service.ts it's `new this.userModel(...)`.
      
      jest.spyOn(PasswordHasher, 'hash').mockResolvedValue('hashed_password');
      
      // Let's redefine model to be a mockable constructor
      const MockModel = jest.fn().mockImplementation(() => ({
        save: saveSpy,
        _id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name,
      }));
      (MockModel as any).findOne = model.findOne;
      
      // Re-compile with the mock constructor
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AuthService,
          {
            provide: getModelToken(User.name),
            useValue: MockModel,
          },
          {
            provide: JwtService,
            useValue: mockJwtService,
          },
          {
            provide: 'AUTH_SERVICE',
            useValue: mockClientProxy,
          },
        ],
      }).compile();
      service = module.get<AuthService>(AuthService);

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(saveSpy).toHaveBeenCalled();
      expect(mockClientProxy.emit).toHaveBeenCalledWith('user.created', expect.any(Object));
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      (model.findOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      model.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
      jest.spyOn(PasswordHasher, 'compare').mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong' };
      model.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
      jest.spyOn(PasswordHasher, 'compare').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const payload = { sub: 'user_id', email: 'test@example.com' };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);

      const result = await service.validateToken('valid_token');

      expect(result).toEqual(payload);
    });

    it('should return null for invalid token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      const result = await service.validateToken('invalid_token');

      expect(result).toBeNull();
    });
  });
});
