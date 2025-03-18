import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const sendImage = mutation({
    args: { storageId: v.id("_storage"), format: v.string(), gigId: v.id("gigs") },
    handler: async (ctx, args) => {
        // check how many images are already uploaded
        const gigMedia = await ctx.db.query("gigMedia").withIndex("by_gigId", (q) => q.eq("gigId", args.gigId)).collect();

        if (gigMedia.length >= 3) {
            throw new Error("Gig already has 3 images. Please delete an image before uploading a new one.");
        }

        await ctx.db.insert("gigMedia", {
            gigId: args.gigId,
            format: args.format,
            storageId: args.storageId,
        });
    }
})

export const remove = mutation({
    args: { id: v.id("_storage") },
    handler: async (ctx, args) => {
        const media = await ctx.db.query("gigMedia").withIndex("by_storageId", (q) => q.eq("storageId", args.storageId)).unique();

        if(!media){
            throw new Error("Media not found");
        }

        await ctx.db.delete(media._id);

        await ctx.storage.delete(args.storageId);
    }
})