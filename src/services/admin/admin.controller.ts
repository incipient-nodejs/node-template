import { NextFunction, Request, Response } from "express";
import * as AdminProvider from "./admin.provider";
import { TGenResObj } from "../../utils/commonInterface.util";
import { CreateAdminType, createAdminValidator, UpdateAdminType, updateAdminValidator, GetAllAdminType, getAllAdminValidator, DeleteAdminType, deleteAdminValidator } from "./admin.validate";

export const adminController = {

  createAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user,
        ...req.body,
        profilePicture: req?.file?.path
      } as CreateAdminType;

      createAdminValidator.parse(payload);

      const { code, data }: TGenResObj = await AdminProvider.createAdmin(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  updateAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.body,
        ...req.user,
        profilePicture: req?.file?.path
      } as UpdateAdminType;

      updateAdminValidator.parse(payload);

      const { code, data }: TGenResObj = await AdminProvider.updateAdmin(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },

  getAllAdmins: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user,
        ...req.query
      } as GetAllAdminType;

      getAllAdminValidator.parse(payload);

      const { code, data }: TGenResObj = await AdminProvider.getAllAdmins(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },



  deleteAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const payload = {
        ...req.user,
        ...req.params
      } as unknown as DeleteAdminType;

      deleteAdminValidator.parse(payload);

      const { code, data }: TGenResObj = await AdminProvider.deleteAdmin(payload);
      res.status(code).json(data);
      return;
    } catch (error) {
      next(error);
    }
  },



}