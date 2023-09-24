import { JobId, JobOptions, JobStatus, Queue } from 'bull';
import { json } from 'stream/consumers';

export const mockBullQueue: Partial<Queue> = {
  add: jest.fn(),
  removeRepeatable: jest.fn(),
};

export const mockBullJob = {
  id: '',
  data: undefined,
  opts: undefined,
  attemptsMade: 0,
  queue: undefined,
  timestamp: 0,
  name: '',
  stacktrace: [],
  returnvalue: undefined,
  progress: function () {
    throw new Error('Function not implemented.');
  },
  log: function (row: string): Promise<any> {
    throw new Error('Function not implemented.');
  },
  isCompleted: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isFailed: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isDelayed: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isActive: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isWaiting: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isPaused: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  isStuck: function (): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
  getState: function (): Promise<JobStatus | 'stuck'> {
    throw new Error('Function not implemented.');
  },
  update: function (data: any): Promise<void> {
    throw new Error('Function not implemented.');
  },
  remove: jest.fn(),
  retry: jest.fn(),
  discard: jest.fn(),
  finished: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  moveToCompleted: function (
    returnValue?: string,
    ignoreLock?: boolean,
    notFetch?: boolean,
  ): Promise<[any, JobId]> {
    throw new Error('Function not implemented.');
  },
  moveToFailed: jest.fn(),
  promote: jest.fn(),
  lockKey: function (): string {
    throw new Error('Function not implemented.');
  },
  releaseLock: jest.fn(),
  takeLock: function (): Promise<number | false> {
    throw new Error('Function not implemented.');
  },
  toJSON: function (): {
    id: JobId;
    name: string;
    data: any;
    opts: JobOptions;
    progress: number;
    delay: number;
    timestamp: number;
    attemptsMade: number;
    failedReason: any;
    stacktrace: string[];
    returnvalue: any;
    finishedOn: number;
    processedOn: number;
  } {
    throw new Error('Function not implemented.');
  },
};
