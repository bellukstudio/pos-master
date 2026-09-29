import { createResource } from '@/lib/api/resource';
import { BranchInput } from './validation';
import { Branch } from './types';
import { FilterParams } from '@/types/types';



export type * from './types';
export type { BranchInput } from './validation';

export const branchApi = createResource<Branch, FilterParams, BranchInput>('admin/branch');