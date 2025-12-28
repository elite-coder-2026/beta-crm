export enum UserRoles {
    SUPER_ADMIN = 'super_admin',
    ADMIN = 'admin',
    SALES_MNANAGER = 'sales_manager',
    SALES_REP = 'sales_rep',
    MARKETING = 'marketing',
    SUPPORT = 'support',
    VIEWER = 'viewer',

}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated',
}

export interface User {
    id: number;
    email: string;
    phone: string | null;
    pwd_hash: string;
    f_name: string;
    l_name: string;
    profile_photo_url: string;
    role: UserRoles;
    department: string | null;
    job_title: string | null;
    employee_id: string | null;
    manager_id: string | null;
    status: UserStatus;
    email_verified: boolean;
    phone_verified: boolean;
    two_factor_enabled: boolean;
    last_login: Date | null;
    created_at: Date | null;
    updated_at: Date | null;
    permissions: Permissions;
}