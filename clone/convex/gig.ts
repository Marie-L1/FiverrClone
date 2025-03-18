import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation ({
    args:{
        title: v.string(),
        description: v.string(),
        subcategoryId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }
        // looking for the user in the with the current token to make sure they are logged in
        const user = await ctx.db.query("users").withIndex("by_token", (q) => 
            q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

        if(user === null) {
            return;
        }

        const gigId = await ctx.db.insert("gigs", {
            title: args.title,
            description: args.description,
            subcategoryId: args.subcategoryId as Id<"subcategories">,
            sellerId: user._id!,
            published: false,
            clicks: 0,
        });

    return gigId;
    }
});

export const get = query({
    args: { id: v.id("gigs") },
    handler: async (ctx, args) => {
        const gig = await ctx.db.get(args.id);
        if (gig === null){
            throw new Error("Gig not found");
        }
        const seller = await ctx.db.get(gig.sellerId as Id<"users">);
        if (!seller){
            throw new Error("Seller not found");
        }
        
        const country = await ctx.db.query("countries").withIndex("by_userId", (q) =>  q.eq("userId", seller._id)).unique();
        if (country === null){
            throw new Error("Country not found");
        }
        const languages = await ctx.db.query("languages").withIndex("by_userId", (q) =>  q.eq("userId", seller._id)).collect();
        const sellerWithCountryAndLanguages = {
            ...seller,
            country: country,
            languages: languages,
        };

        const gigWithSeller = {
            ...gig,
            seller: sellerWithCountryAndLanguages,
        };

        const lastOrder = await ctx.db.query("orders")
        .withIndex("by_gigId", (q) => q.eq("gigId", gig._id)).order("desc").first();

        const gigWithSellerAndLastOrder ={
            ...gigWithSeller,
            lastOrder: lastOrder,
        }

        const images = await ctx.db.query("gigMedia").withIndex("by_gigId", (q) => q.eq("gigId", gig._id)).collect();

        const imagesWithUrls = await Promise.all(images.map(async(image) => {
            // have to generate the image url first
            const imageUrl = await ctx.storage.getUrl(image.storageId);
            if (!imageUrl){
                throw new Error("Image not found");
            };
            return { ...image, url: imageUrl };
        }));

        const gigWithSellerAndLastOrderAndImages = {
            ...gigWithSellerAndLastOrder,
            images: imagesWithUrls,
        };

        return gigWithSellerAndLastOrderAndImages;
    }
});

export const isPublished = query({
    args: { id: v.id("gigs") },
    handler: async (ctx, args) => {
        const gig = await ctx.db.get(args.id);
        if (gig === null){
            throw new Error("Gig not found");
        }
        return gig.published;
    }
});

export const publish = mutation({
    args: { id: v.id("gigs") },
    handler: async (ctx, args) => {
        const gig = await ctx.db.get(args.id);
        if (gig === null){
            throw new Error("Gig not found");
        }

        const media = await ctx.db.query("gigMedia").withIndex("by_gigId", (q) => q.eq("gigId", gig._id)).collect();

        const offers = await ctx.db.query("offers").withIndex("by_gigId", (q) => q.eq("gigId", gig._id)).collect();

        if (media.length === 0 || gig.description === "" || offers.length !== 3){
            throw new Error("Gig must have at least 1 image and 3 offers");
        }

        await ctx.db.patch(gig._id, { published: true });

        return gig;
    }
});

export const unpublish = mutation({
    args: { id: v.id("gigs") },
    handler: async (ctx, args) => {
        const gig = await ctx.db.get(args.id);
        if (gig === null){
            throw new Error("Gig not found");
        }
        await ctx.db.patch(args.id, { published: false });
        return gig;
    }
})

export const remove = mutation({
    args: { id: v.id("gigs") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
        .query("users").withIndex("by_token", (q) => 
            q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();

        if (user === null){
            return;
        }

        const userId = user._id;

        const existingFavourite = await ctx.db.query("userFavourites")
        .withIndex("by_user_gig", (q) => q.eq("userId", userId).eq("gigId", args.id)).unique();

        if(existingFavourite){
            await ctx.db.delete(existingFavourite._id);
        }

        await ctx.db.delete(args.id);
    }
})


export const updateDescription = mutation({
    args: { id: v.id("gigs"), description: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const description = args.description.trim();

        if (!description) {
            throw new Error("Description is required");
        }

        if (description.length > 20000) {
            throw new Error("Description is too long!")
        }

        const gig = await ctx.db.patch(args.id, {
            description: args.description,
        });

        return gig;
    },
});

export const update = mutation({
    args: { id: v.id("gigs"), title: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const title = args.title.trim();

        if (!title) {
            throw new Error("Title is required");
        }

        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters")
        }

        const gig = await ctx.db.patch(args.id, {
            title: args.title,
        });

        return gig;
    },
});