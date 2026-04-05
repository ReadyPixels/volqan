/**
 * @file types/aws-sdk.d.ts
 * @description Ambient type declarations for `@aws-sdk/client-s3`.
 *
 * The AWS SDK is a runtime-only (optional) dependency used by the S3
 * storage provider. This declaration file provides just enough type
 * coverage for the Volqan S3StorageProvider to compile without
 * installing the full `@aws-sdk/client-s3` package.
 */

declare module '@aws-sdk/client-s3' {
  export class S3Client {
    constructor(config: Record<string, unknown>);
    send(command: unknown): Promise<any>;
  }

  export class PutObjectCommand {
    constructor(params: PutObjectCommandInput);
  }

  export class GetObjectCommand {
    constructor(params: Record<string, unknown>);
  }

  export class DeleteObjectCommand {
    constructor(params: DeleteObjectCommandInput);
  }

  export class ListObjectsV2Command {
    constructor(params: ListObjectsV2CommandInput);
  }

  export class HeadObjectCommand {
    constructor(params: Record<string, unknown>);
  }

  export interface PutObjectCommandInput {
    Bucket?: string;
    Key?: string;
    Body?: Buffer | Uint8Array | string;
    ContentType?: string;
    ContentLength?: number;
    ACL?: string;
    [key: string]: unknown;
  }

  export interface DeleteObjectCommandInput {
    Bucket?: string;
    Key?: string;
    [key: string]: unknown;
  }

  export interface ListObjectsV2CommandInput {
    Bucket?: string;
    Prefix?: string;
    MaxKeys?: number;
    [key: string]: unknown;
  }

  export interface _Object {
    Key?: string;
    Size?: number;
    LastModified?: Date;
    [key: string]: unknown;
  }
}
