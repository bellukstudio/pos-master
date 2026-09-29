import { createResource } from '@/lib/api/resource';
import { CategoryProductInput } from './validation';
import { CategoryProduct } from './types';
import { FilterParams } from '@/types/types';


export type * from './types';
export type { CategoryProductInput } from './validation';

export const categoryProductApi = createResource<CategoryProduct, FilterParams, CategoryProductInput>('admin/category-product');