import {mutation, query} from "./_generated/server";
import {Id} from "./_generated/dataModel";

const categories = [
    {name: "Software Development"},
    {name: "Web Development"},
    {name: "Mobile Development"},
    {name: "UX Design"},
    {name: "Marketing"},
    {name: "Branding"},
    {name: "Data Science"},
    {name: "Digital Marketing"},
    {name: "Video Editing"},
    {name: "Content Writing"},
    {name: "Graphic Design"},
    {name: "Animation"},
    {name: "Video Production"},
    {name: "Music Production"},
    {name: "Photography"},
    {name: "Artificial Intelligence"},
    {name: "Game Development"},
    {name: "Finance"},
]

export const create = mutation({
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        categories.map(async (category) => {
            await ctx.db.insert("categories", {
               name: category.name 
            })
        })

        return;
    }
})