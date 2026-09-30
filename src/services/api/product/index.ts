import { createResource } from "@/lib/api/resource";
import type { Product } from "./types";
import type { ProductInput } from "./validation";
import { FilterParams } from "@/types/types";

export type * from "./types";
export type { ProductInput, ProductFieldErrors } from "./validation";
export { productInputSchema, toFieldErrors } from "./validation";

export const productApi = createResource<Product, FilterParams, ProductInput, ProductInput>(
    "admin/product",
);
