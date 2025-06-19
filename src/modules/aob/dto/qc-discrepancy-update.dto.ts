import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '@/common/constants/document-status.constants';

class DocumentUpdateDto {
  @IsNotEmpty()
  @IsString()
  documentId!: string;

  @IsNotEmpty()
  @IsString()
  documentType!: string;

  @IsNotEmpty()
  @IsString()
  documentName!: string;

  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status!: DocumentStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class QcDiscrepancyUpdateDto {
  @IsNotEmpty()
  @IsString()
  applicationId!: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentUpdateDto)
  documents!: DocumentUpdateDto[];

  @IsOptional()
  @IsBoolean()
  updateApplicationStatus?: boolean;
}
