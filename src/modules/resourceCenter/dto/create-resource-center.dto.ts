import { v4 as uuidv4 } from 'uuid';

interface ChannelInfo {
  channelId: string;
  channelName: string;
}

interface TagInfo {
  tagName: string;
  tagId: string;
}

interface RoleInfo {
  roleId: string;
  roleName: string;
}

export class CreateResourceCenterDto {
  channelId!: ChannelInfo[];
  resourceCategory!: string;
  subCategory!: string[];
  isActive?: boolean;
  title!: string;
  description!: string;
  documentId?: string;
  publish!: 'publish' | 'draft';
  tags!: TagInfo[];
  roles!: RoleInfo[];
  updatedBy?: string;
  createdBy?: string;

  constructor(data: Partial<CreateResourceCenterDto>) {
    Object.assign(this, data);
    // Generate UUID for documentId if not provided
    this.documentId ??= uuidv4();
    // Set default value for isActive
    this.isActive ??= false;
  }
}
