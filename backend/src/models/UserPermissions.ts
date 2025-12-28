export enum Permissions {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    EXPORT = 'export',
    MANAGE = 'manage',
    VIEW_ALL = 'viewAll',
}

export enum Resources {
    CONTACTS = 'contacts',
    COMPANIES = 'companies',
    DEALS = 'deals',
    REPORTS = 'reports',
    USER = 'user',
    SETTINGS = 'settings',
    INTEGRATIONS = 'integrations',
}

export interface UserPermissions {
    id: number;
    user_id: number;
    permissions: Permissions;
    resources: Resources;
    granted_at: Date;
    granted_by: number | null;
}