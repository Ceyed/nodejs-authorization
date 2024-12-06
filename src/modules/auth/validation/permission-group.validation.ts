import { z } from 'zod';
import { ModulesEnum } from '../../../common/enums/modules.enum';
import { PermissionsEnum } from '../../../common/enums/permissions.enum';

const permissionSchema = z.string().refine(
    (val) => {
        const [module, permission] = val.split(':');
        return (
            Object.values(ModulesEnum).includes(module as ModulesEnum) &&
            Object.values(PermissionsEnum).includes(permission as PermissionsEnum)
        );
    },
    {
        message: 'Invalid permission format',
    },
);

export const createPermissionGroupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    permissions: z.array(permissionSchema).min(1, 'At least one permission is required'),
});
