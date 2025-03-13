import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";


export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        console.log("identity", identity);
        if (!identity) {
            throw new Error("Unauthorized");
        }

        // check if user already exists
        const user = await ctx.db.query("users").withIndex("by_token", (q) => 
            q.eq("tokenIdentifier", identity.tokenIdentifier)).unique();
        if (user !== null){
            // if the user is identified but the name has changed, patch the value
            if (user.username !== identity.nickname){
                await ctx.db.patch(user._id, {
                    username: identity.nickname
                })
            }
            return user._id;
        }
        // if user has a new identity create a new "User"
        const userId = await ctx.db.insert("users", {
            fullName: identity.name!,
            tokenIdentifier: identity.tokenIdentifier,
            title: "",
            about: "",
            username: identity.nickname!,
            profileImageUrl: identity.profileUrl,
        })


        return userId;
    }
});

export const getCurrentUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        // throw new Error("Unauthenticated call to query");
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        return user;
    }
});

export const get = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        return user;
    },
});

export const getLanguagesByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const languages = await ctx.db
            .query("languages")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        return languages;
    },
});

export const getCountryByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const country = await ctx.db.query("countries")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .unique();

        if (!country) {
            throw new Error("Country not found");
        }
        return country;
    },
});