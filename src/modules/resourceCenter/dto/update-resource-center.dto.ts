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

export class UpdateResourceCenterDto {
  channelId?: ChannelInfo[];
  projectId?: string;
  resourceCategory?: string;
  subCategory?: string[];
  isActive?: boolean;
  title?: string;
  description?: string;
  publish?: 'publish' | 'draft';
  tags?: TagInfo[];
  roles?: RoleInfo[];
  updatedBy?: string;
}
