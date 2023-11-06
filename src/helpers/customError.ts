export default function customError(errorMsg: string, status: number){
    var error: any = new Error(errorMsg);
    error.status = status;
    return error
}