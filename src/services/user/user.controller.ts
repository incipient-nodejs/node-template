import { NextFunction, Request, Response } from "express";
import * as UserProvider from './user.provider';
import { TGenResObj } from "../../utils/commonInterface.util";
import { changePasswordValidatorType, deactivateAccountType, deactivateAccountValidator, forgetPasswordValidator, getAllUserType, getAllUserValidator, getUserByIdType, getUserDetailsType, resetPasswordValidator, resetPasswordValidatorType, signInValidator, signUpValidator, updatePasswordType, updatePasswordValidator, updateUserType, updateUserValidator, userListingAndSearchValidator, verifyUserValidator, verifyUserValidatorType, deleteUserAccountType, deleteUserAccountValidator, CreateUserType, createUserValidator } from "./user.validate";


export const userControler = {

  signupUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      signUpValidator.parse(body);

      const { code, data }: TGenResObj = await UserProvider.signupUser(body);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  signinUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;

      signInValidator.parse(body);

      const { code, data }: TGenResObj = await UserProvider.signinUser(body);
      res.status(code).json(data);
      return;

    } catch (error) {
      next(error);
    }
  },

  verifyUser: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.params,
      } as verifyUserValidatorType;

      verifyUserValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.verifyUser(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  forgetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const { body } = req;

      forgetPasswordValidator.parse(body);

      const { code, data }: TGenResObj = await UserProvider.forgetPassword(body);
      res.status(code).json(data);
      return
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.params,
        ...req.body,
      } as resetPasswordValidatorType;

      resetPasswordValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.resetPassword(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.body,
      } as changePasswordValidatorType;

      const { code, data }: TGenResObj = await UserProvider.changePassword(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  updatePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.body,
        ...req.user,
      } as updatePasswordType;

      updatePasswordValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.updatePassword(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  getUserDetails: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user
      } as getUserDetailsType;

      const { code, data }: TGenResObj = await UserProvider.getUserDetails(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  updateUser: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.body,
        ...req.user,
        profilePicture: req.file?.path
      } as updateUserType;

      updateUserValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.updateUser(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  getAllUser: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user,
        ...req.query
      } as getAllUserType;

      getAllUserValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.getAllUser(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.params,
      } as getUserByIdType;

      const { code, data }: TGenResObj = await UserProvider.getUserById(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  updateUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.params,
        ...req.body,
        profilePicture: req?.file?.path
      } as updateUserType;

      updateUserValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.updateUserById(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  deactivateAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user
      } as deactivateAccountType;

      deactivateAccountValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.deactivateAccount(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },



  deleteUserAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        ...req.user,
        ...req.query
      } as deleteUserAccountType;

      deleteUserAccountValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.deleteUserAccount(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  checkUserFreeAccess: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = {
        ...req.user
      } as getUserDetailsType;

      const { code, data }: TGenResObj = await UserProvider.checkUserFreeAccess(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user,
        ...req.body,
        profilePicture: req?.file?.path
      } as CreateUserType;

      createUserValidator.parse(payload);

      const { code, data }: TGenResObj = await UserProvider.createUser(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  }

}

