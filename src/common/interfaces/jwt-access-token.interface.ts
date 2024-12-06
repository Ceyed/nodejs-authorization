import { RolesEnum } from '../enums/roles.enum';

export interface JwtAccessTokenInterface {
    // sub: mongoose.Types.ObjectId;
    sub: string;
    email: string;
    role: RolesEnum;
    iat: number;
    exp: number;
}
