import { ModuleResponseDto } from '@/modules/module/dto/module-response.dto';
import { plainToInstance } from 'class-transformer';

describe('ModuleResponseDto', () => {
  it('should transform plain object to instance', () => {
    const plain = {
      _id: '123',
      name: 'Test Module',
      code: 'TEST',
      description: 'Test Description',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const dto = plainToInstance(ModuleResponseDto, plain);

    expect(dto).toBeInstanceOf(ModuleResponseDto);
    expect(dto._id).toBe(plain._id);
    expect(dto.name).toBe(plain.name);
    expect(dto.code).toBe(plain.code);
    expect(dto.description).toBe(plain.description);
    expect(dto.isActive).toBe(plain.isActive);
    expect(dto.createdAt).toEqual(plain.createdAt);
    expect(dto.updatedAt).toEqual(plain.updatedAt);
  });
}); 