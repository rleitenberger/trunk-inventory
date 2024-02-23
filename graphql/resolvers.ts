import prisma from '@/lib/prisma';

export const resolvers = {
    Query: {
        getOrganizations: async () => {
            return await prisma.organizations.findMany();
        },
        getLocations: async (_: any, { organizationId, search }: { 
            organizationId: string
            search: string 
        }) => {
            return await prisma.locations.findMany({
                where: {
                    organization_id: {
                        equals: organizationId
                    },
                    name: {
                        contains: search
                    }
                }
            });
        }
    }
}