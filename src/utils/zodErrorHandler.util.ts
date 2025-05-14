
import { z, ZodError } from "zod";

export function ZODErrorMessage(errorObject: ZodError): string | false {
    if (errorObject?.issues?.length > 0) {
        console.log(errorObject.issues);
        
        return errorObject.issues[0].message;
    }
    return false;
}
