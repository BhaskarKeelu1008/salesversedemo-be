import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
} 