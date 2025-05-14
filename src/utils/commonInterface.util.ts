export type TResponse = {
    code: number;
    data: TGenResObj;
  };

  type TGenResObjData = {
    status : boolean,
    message : string,
    data : any
  }

  export type TGenResObj = {
    code: number,
    data?: TGenResObjData,
  };