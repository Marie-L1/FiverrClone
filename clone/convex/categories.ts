import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
// once the data changes, the query will be automatically re-run
export const get = query ({
    handler: async (ctx) => {
        const categories = await ctx.db.query("categories").collect();

        const categoriesWithSubcategoriesRelations = 
        categories.map((category) => {
            return ctx.db
            .query("subcategories")
            .withIndex("by_categoryId", (q) =>
                q .eq("categoryId", category._id)
            ).collect()
            .then((subcategories) => {
                return {
                    ...category, 
                    subcategories: subcategories,
                };
            });
        });

        // resolve the promises
        const categoriesWithSubcategories = await Promise.all(
            categoriesWithSubcategoriesRelations
        )
    }
})