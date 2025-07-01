// Node.js environment extensions for deployment

declare global {
  var process: {
    env: Record<string, string | undefined>;
    cwd(): string;
    exit(code?: number): never;
    platform: string;
    version: string;
    argv: string[];
  };

  var require: (id: string) => any;
  
  var module: {
    exports: any;
    id: string;
    filename: string;
    loaded: boolean;
    parent: any;
    children: any[];
  };

  var __dirname: string;
  var __filename: string;

  var console: {
    assert(condition?: boolean, ...data: any[]): void;
    clear(): void;
    count(label?: string): void;
    countReset(label?: string): void;
    debug(...data: any[]): void;
    dir(item?: any, options?: any): void;
    dirxml(...data: any[]): void;
    error(...data: any[]): void;
    group(...data: any[]): void;
    groupCollapsed(...data: any[]): void;
    groupEnd(): void;
    info(...data: any[]): void;
    log(...data: any[]): void;
    table(tabularData?: any, properties?: string[]): void;
    time(label?: string): void;
    timeEnd(label?: string): void;
    timeLog(label?: string, ...data: any[]): void;
    trace(...data: any[]): void;
    warn(...data: any[]): void;
  };

  var Buffer: {
    alloc(size: number, fill?: string | Buffer | number, encoding?: BufferEncoding): Buffer;
    allocUnsafe(size: number): Buffer;
    allocUnsafeSlow(size: number): Buffer;
    byteLength(string: string | NodeJS.ArrayBufferView | ArrayBuffer | SharedArrayBuffer, encoding?: BufferEncoding): number;
    compare(buf1: Uint8Array, buf2: Uint8Array): number;
    concat(list: ReadonlyArray<Uint8Array>, totalLength?: number): Buffer;
    from(data: any): Buffer;
    isBuffer(obj: any): obj is Buffer;
    isEncoding(encoding: string): encoding is BufferEncoding;
  };

  interface Buffer extends Uint8Array {
    write(string: string, encoding?: BufferEncoding): number;
    write(string: string, offset: number, encoding?: BufferEncoding): number;
    write(string: string, offset: number, length: number, encoding?: BufferEncoding): number;
    toString(encoding?: BufferEncoding, start?: number, end?: number): string;
    toJSON(): { type: 'Buffer'; data: number[] };
    equals(otherBuffer: Uint8Array): boolean;
    compare(target: Uint8Array, targetStart?: number, targetEnd?: number, sourceStart?: number, sourceEnd?: number): number;
    copy(target: Uint8Array, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
    slice(start?: number, end?: number): Buffer;
    subarray(start?: number, end?: number): Buffer;
    writeUIntLE(value: number, offset: number, byteLength: number): number;
    writeUIntBE(value: number, offset: number, byteLength: number): number;
    writeIntLE(value: number, offset: number, byteLength: number): number;
    writeIntBE(value: number, offset: number, byteLength: number): number;
    readUIntLE(offset: number, byteLength: number): number;
    readUIntBE(offset: number, byteLength: number): number;
    readIntLE(offset: number, byteLength: number): number;
    readIntBE(offset: number, byteLength: number): number;
    readUInt8(offset: number): number;
    readUInt16LE(offset: number): number;
    readUInt16BE(offset: number): number;
    readUInt32LE(offset: number): number;
    readUInt32BE(offset: number): number;
    readInt8(offset: number): number;
    readInt16LE(offset: number): number;
    readInt16BE(offset: number): number;
    readInt32LE(offset: number): number;
    readInt32BE(offset: number): number;
    readFloatLE(offset: number): number;
    readFloatBE(offset: number): number;
    readDoubleLE(offset: number): number;
    readDoubleBE(offset: number): number;
    reverse(): this;
    swap16(): Buffer;
    swap32(): Buffer;
    swap64(): Buffer;
    writeUInt8(value: number, offset: number): number;
    writeUInt16LE(value: number, offset: number): number;
    writeUInt16BE(value: number, offset: number): number;
    writeUInt32LE(value: number, offset: number): number;
    writeUInt32BE(value: number, offset: number): number;
    writeInt8(value: number, offset: number): number;
    writeInt16LE(value: number, offset: number): number;
    writeInt16BE(value: number, offset: number): number;
    writeInt32LE(value: number, offset: number): number;
    writeInt32BE(value: number, offset: number): number;
    writeFloatLE(value: number, offset: number): number;
    writeFloatBE(value: number, offset: number): number;
    writeDoubleLE(value: number, offset: number): number;
    writeDoubleBE(value: number, offset: number): number;
    fill(value: string | Uint8Array | number, offset?: number, end?: number, encoding?: BufferEncoding): this;
    indexOf(value: string | number | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;
    lastIndexOf(value: string | number | Uint8Array, byteOffset?: number, encoding?: BufferEncoding): number;
    entries(): IterableIterator<[number, number]>;
    includes(value: string | number | Buffer, byteOffset?: number, encoding?: BufferEncoding): boolean;
    keys(): IterableIterator<number>;
    values(): IterableIterator<number>;
  }

  type BufferEncoding = "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex";
}

export {};