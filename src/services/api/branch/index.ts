import { createResource } from '@/lib/api/resource';
import { BranchInput } from './validation';
import { Branch, BranchFilter } from './types';



export type * from './types';
export type { BranchInput } from './validation';

export const branchApi = createResource<Branch, BranchFilter, BranchInput>('admin/branch');