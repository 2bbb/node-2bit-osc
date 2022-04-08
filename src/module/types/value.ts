export type BufferLike = Buffer | ArrayBuffer | Uint8Array;

// about Timetag
export type RelativeSecondsFromNow = number;
export type SecondsSince1900 = number;
export type FractionalSeconds = number;

export type TimetagReceived = [ SecondsSince1900, FractionalSeconds ];
export type TimetagSending = 
    | null // mean immediately???
    | Date
    | RelativeSecondsFromNow
    | TimetagReceived;

export const TypeNameToTagMap = {
    string:  's',
    integer: 'i',
    timetag: 't',
    float:   'f',
    double:  'd',
    blob:    'b',
    true:    'T',
    false:   'F',
    null:    'N',
    bang:    'I',
} as const;

export type TagToValueType = {
    s: string,
    i: number,
    t: TimetagSending,
    f: number,
    d: number,
    b: Buffer,
    T: true,
    F: false,
    N: null,
    I: null,
};
    
export type TypeNameToValueType = {
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

export type TypeNameToTag = typeof TypeNameToTagMap;
export type TypeName = keyof TypeNameToTag;
export type Tag = TypeNameToTag[TypeName];
export type ValueType = TypeNameToValueType[TypeName];
