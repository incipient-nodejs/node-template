import z from "zod";

// Validate register request
export const signUpValidator = z.object({

    fullName: z.string(
        {
            required_error: "Full name is required",
            invalid_type_error: "Full name must be a string",
        }
    ).min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long"),

    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    })
        .email()
        .max(100, "Email must be at most 100 characters long")
        .transform((email) => email.toLowerCase().trim()),

    password: z.string(
        {
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long"),

});

export type signUpType = z.infer<typeof signUpValidator>;


export const signInValidator = z.object({

    email: z.string(
        {
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        }
    ).email()
        .max(100, "Email must be at most 100 characters long"),

    password: z.string(
        {
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long"),

    platform: z.string(
        {
            invalid_type_error: "platform must be a string",
        }
    ).optional()

});

export type signInType = z.infer<typeof signInValidator>;

export const verifyUserValidator = z.object({

    code: z.string({
        required_error: "Verification Code is required",
        invalid_type_error: "Verification Code must be a string",
    }),

    userId: z.string({
        required_error: "Verification Code is required",
        invalid_type_error: "User Id must be a string",
    }),

});

export type verifyUserValidatorType = z.infer<typeof verifyUserValidator>;


export const userListingAndSearchValidator = z.object({

    search: z.string(
        {
            invalid_type_error: "Search parameter must be a string",
        }
    ).optional(),

    status: z.enum(
        [
            "ACTIVE",
            "INACTIVE"
        ],
    ).optional(),

    page: z.string(
        {
            invalid_type_error: "Page must be a number",
        }
    ).min(1, "Page must be at least 1")
        .optional(),

    pageSize: z.string(
        {
            invalid_type_error: "Page size must be a number",
        }
    ).optional(),

    createdAt: z.date(
        {
            invalid_type_error: "CreatedAt at must be in date format",
        }
    ).optional(),

});

export type userListingAndSearchValidatorType = z.infer<typeof userListingAndSearchValidator>;

export const forgetPasswordValidator = z.object({

    email: z.string(
        {
            required_error: "Email is required",
            invalid_type_error: "Email must be a string",
        }
    )
        .email()
        .max(100, "Email must be at most 100 characters long"),

});

export type forgetPasswordValidatorType = z.infer<typeof forgetPasswordValidator>;

export const changePasswordValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

    password: z.string(
        {
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long"),

});

export type changePasswordValidatorType = z.infer<typeof changePasswordValidator>;

export const resetPasswordValidator = z.object({

    code: z.string({
        required_error: "Verification Code is required",
        invalid_type_error: "Verification Code must be a string",
    }),

    userId: z.string({
        required_error: "Verification Code is required",
        invalid_type_error: "User Id must be a string",
    }),

    newPassword: z.string(
        {
            required_error: "Password is required",
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long"),

});

export type resetPasswordValidatorType = z.infer<typeof resetPasswordValidator>;


export const getUserDetailsValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

});

export type getUserDetailsType = z.infer<typeof getUserDetailsValidator>;


export const getAllUserValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

    search: z.string(
        {
            invalid_type_error: "Search parameter must be a string",
        }
    ).optional(),

    status: z.enum(
        [
            "ACTIVE",
            "INACTIVE"
        ],
    ).optional(),

    page: z.string(
        {
            invalid_type_error: "Page number must be a number",
        }
    ).optional(),

    pageSize: z.string(
        {
            invalid_type_error: "Page size must be a number",
        }
    ).optional(),

});

export type getAllUserType = z.infer<typeof getAllUserValidator>;


export const updateUserValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

    role: z.string(
        {
            required_error: "Role is required",
            invalid_type_error: "Role must be a string",
        }
    ).optional(),

    profilePicture: z.any(
        {
            invalid_type_error: "Profile picture must be a string",
        }
    )
        .optional(),

    status: z.enum(
        [
            "ACTIVE",
            "INACTIVE"
        ],
    ).optional(),

    fullName: z.string(
        {
            invalid_type_error: "Full name must be a string",
        }
    ).min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long")
        .optional(),

    oldPassword: z.string(
        {
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long")
        .optional(),

    newPassword: z.string(
        {
            invalid_type_error: "Password must be a string",
        }
    ).min(8, "Password must be at least 8 characters long")
        .max(16, "Password must be at most 16 characters long")
        .optional(),

    freeAccess: z.boolean().optional(),
}).refine((data: any) => {
    if (data.oldPassword && !data.newPassword) {
        return false;
    }
    return true;
}, {
    message: "New password is required when old password is provided",
    path: ["newPassword"],
});

export type updateUserType = z.infer<typeof updateUserValidator>;


export const getUserByIdValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

});

export type getUserByIdType = z.infer<typeof getUserByIdValidator>;


export const updatePasswordValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

    oldPassword: z.string(
        {
            required_error: "Old Password is required",
            invalid_type_error: "Old Password must be a string",
        }
    )
        .min(8, "Old Password must be at least 8 characters long")
        .max(16, "Old Password must be at most 16 characters long"),

    newPassword: z.string(
        {
            required_error: "New Password is required",
            invalid_type_error: "New Password must be a string",
        }
    )
        .min(8, "New Password must be at least 8 characters long")
        .max(16, "New Password must be at most 16 characters long"),

});

export type updatePasswordType = z.infer<typeof updatePasswordValidator>;


export const deactivateAccountValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),

});

export type deactivateAccountType = z.infer<typeof deactivateAccountValidator>;

export const deleteUserAccountValidator = z.object({

    userId: z.string(
        {
            required_error: "User Id is required",
            invalid_type_error: "User Id must be a string",
        }
    ),
    userIdForDelete: z.string(
        {
            required_error: "User is required for delete User",
            invalid_type_error: "User Id must be a string for delete User",
        }
    ).optional(),
});

export type deleteUserAccountType = z.infer<typeof deleteUserAccountValidator>;



export const createUserValidator = z.object({
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

export type CreateUserType = z.infer<typeof createUserValidator>;

