import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsIn,
  ValidateNested,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DocumentStatusUpdateDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['approve', 'reject', 'qcReject', 'documentSubmitted'])
  documentStatus!: 'approve' | 'reject' | 'qcReject' | 'documentSubmitted';

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class BatchUpdateDocumentStatusDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsMongoId()
  @IsOptional()
  projectId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentStatusUpdateDto)
  documents!: DocumentStatusUpdateDto[];
}
