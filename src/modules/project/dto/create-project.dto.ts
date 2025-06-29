import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsEnum,
  ArrayMinSize,
  IsObject,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ModuleConfig {
  @IsMongoId()
  @IsNotEmpty()
  moduleId: string = '';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsObject()
  @IsOptional()
  config?: Record<string, unknown> = {};
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  projectName: string = '';

  @IsString()
  @IsNotEmpty()
  projectCode: string = '';

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one module must be selected' })
  @Type(() => ModuleConfig)
  modules: ModuleConfig[] = [];

  @IsEnum(['active', 'inactive'])
  @IsOptional()
  projectStatus?: 'active' | 'inactive' = 'active';
}
