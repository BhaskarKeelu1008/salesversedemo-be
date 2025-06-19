import { Schema, model, type Types } from 'mongoose';
import type { IBaseModel } from './base.model';
import type { IModule } from './module.model';
import type { IProject } from './project.model';

export interface IConfigValue {
  key: string;
  value: string;
  displayName?: string;
  dependentValues?: string[];
}

export interface IConfigField {
  fieldName: string;
  fieldType: string;
  description?: string;
  values: IConfigValue[];
}

export interface IModuleConfig extends IBaseModel {
  moduleId: Types.ObjectId | IModule;
  projectId?: Types.ObjectId | IProject;
  configName: string;
  description?: string;
  fields: IConfigField[];
  metadata?: Record<string, unknown>;
}

const configValueSchema = new Schema<IConfigValue>({
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  dependentValues: {
    type: [String],
  },
});

const configFieldSchema = new Schema<IConfigField>({
  fieldName: {
    type: String,
    required: true,
  },
  fieldType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  values: {
    type: [configValueSchema],
    required: true,
  },
});

const moduleConfigSchema = new Schema<IModuleConfig>(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    configName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fields: {
      type: [configFieldSchema],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'moduleConfigs',
  },
);

// Indexes
moduleConfigSchema.index(
  { moduleId: 1, projectId: 1, configName: 1 },
  { unique: true },
);
moduleConfigSchema.index({ moduleId: 1 });
moduleConfigSchema.index({ projectId: 1 });
moduleConfigSchema.index({ configName: 1 });
moduleConfigSchema.index({ isDeleted: 1 });
moduleConfigSchema.index({ createdAt: -1 });

moduleConfigSchema.set('toJSON', { virtuals: true });
moduleConfigSchema.set('toObject', { virtuals: true });

export const ModuleConfigModel = model<IModuleConfig>(
  'ModuleConfig',
  moduleConfigSchema,
);
