import mongoose from 'mongoose';
import { RolesEnum } from '../enums/roles.enum';

export interface UserInterface {
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    email: string;
    password: string;
    role: RolesEnum;
}
