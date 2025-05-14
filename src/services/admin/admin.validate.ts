import z from "zod";

export const createAdminValidator = z.object({
    fullName: z.string({
        required_error: "Full name is required",
        invalid_type_error: "Full name must be a string"
    }),

    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string"
    }).email("Please provide a valid email address"),


    profilePicture: z.string({
        invalid_type_error: "Profile picture must be a string"
    }).optional(),

    status: z.enum(["ACTIVE", "INACTIVE"], {
        invalid_type_error: "Status must be either ACTIVE or INACTIVE"
    }).default("ACTIVE")
});

export type CreateAdminType = z.infer<typeof createAdminValidator>;

export const updateAdminValidator = z.object({
    adminId: z.string({
        required_error: "Admin ID is required",
        invalid_type_error: "Admin ID must be a string"
    }),

    fullName: z.string({
        invalid_type_error: "Full name must be a string"
    }).optional(),

    email: z.string({
        invalid_type_error: "Email must be a string"
    }).email("Please provide a valid email address").optional(),

    profilePicture: z.string({
        invalid_type_error: "Profile picture must be a string"
    }).optional(),

    status: z.enum(["ACTIVE", "INACTIVE"], {
        invalid_type_error: "Status must be either ACTIVE or INACTIVE"
    }).optional(),

});

export type UpdateAdminType = z.infer<typeof updateAdminValidator>;


export const getAllAdminValidator = z.object({
    search: z.string({
        invalid_type_error: "Search parameter must be a string"
    }).optional(),

    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),

    page: z.string({
        invalid_type_error: "Page must be a string"
    })
        .refine(
            (value) => !isNaN(Number(value)) && Number(value) >= 1,
            {
                message: "Page must be at least 1"
            }
        ).optional(),

    pageSize: z.string({
        invalid_type_error: "Page size must be a string"
    })
        .refine(
            (value) => !isNaN(Number(value)) && Number(value) >= 1,
            {
                message: "Page size must be at least 1"
            }
        ).optional()
});

export type GetAllAdminType = z.infer<typeof getAllAdminValidator>;

export const deleteAdminValidator = z.object({
    adminId: z.string({
        required_error: "Admin ID is required",
        invalid_type_error: "Admin ID must be a string"
    }),

    userId: z.string({
        invalid_type_error: "User ID must be a string"
    }).optional()
});

export type DeleteAdminType = z.infer<typeof deleteAdminValidator>;

export const getAdminValidator = z.object({
    adminId: z.string({
        required_error: "Admin ID is required",
        invalid_type_error: "Admin ID must be a string"
    })
});

export type GetAdminType = z.infer<typeof getAdminValidator>;
