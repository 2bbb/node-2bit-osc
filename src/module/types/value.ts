export type BufferLike = Buffer | ArrayBuffer | Uint8Array;

// about Timetag
export type RelativeSecondsFromNow = number;
export type SecondsSince1900 = number;
export type FractionalSeconds = number;

export type TimetagReceived = [SecondsSince1900, FractionalSeconds]
export type TimetagSending = 
    | null // mean immediately???
    | Date
    | RelativeSecondsFromNow
    | TimetagReceived;
    
export interface ValueTypeMap {
    string:  string;
    integer: number;
    timetag: TimetagSending;
    float:   number;
    double:  number;
    blob:    Buffer;
    true:    true;
    false:   false;
    null:    null;
    bang:    null;
};

export type ValueType = keyof ValueTypeMap;
