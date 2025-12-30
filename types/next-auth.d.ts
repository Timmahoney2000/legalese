import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            image?: string | null;
            plan: 'FREE' | 'PRO' | 'BUSINESS';
        };
    }

    interface User {
        id: string;
        email: string;
        name?: string | null;
        image?: string | null;
        plan?: 'FREE' | 'PRO' | 'BUSINESS';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        plan: 'FREE' | 'PRO' | 'BUSINESS';
    }
}