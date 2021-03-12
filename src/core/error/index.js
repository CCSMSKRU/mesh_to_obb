export default function MyError(message, data){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, MyError);
    this.message= message;
    this.data = (typeof data==="undefined")? {} : data;
}
MyError.prototype = Object.create(Error.prototype);
MyError.prototype.name = 'MyError';


export function UserError(message, data){
    Error.apply(this,arguments);
    Error.captureStackTrace(this, UserError);
    this.message= message;
    this.data = (typeof data==="undefined")? {} : data;
}
UserError.prototype = Object.create(UserError.prototype);
UserError.prototype.name = 'UserError';

export function UserOk(message, params){
    this.message = message;
    if (typeof params==="string") this.type = params;
    if (typeof message==="object") {
        for (var i in message) {
            this[i] = message[i];
        }
    }
    if (typeof params==="object" && params !== null) {
        for (var i in params) {
            if (['code', 'time'].indexOf(i) !== -1) continue;
            this[i] = params[i];
        }
    }
    // this.data = this.data || typeof params === "object" && params !== null? {...params} : {};
    this.data = (typeof this.data!=="undefined")? this.data : (typeof params === "object" && params !== null)? {...params} : {};
    this.message = (typeof this.message!=="undefined") ? this.message : '';
}


export function isError(error){
    return error instanceof MyError
        || error instanceof UserError
}


//
// exports.UserOk = UserOk;
// exports.UserError = UserError;
// exports.BankError = BankError;
// exports.MyError = MyError;
// exports.AuthError = AuthError;
// exports.HttpError = HttpError;
