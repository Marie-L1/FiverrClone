import { mutation } from "./_generated/server";

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
            if (user.username !== identity.name){
                await ctx.db.patch(user._id, {
                    username: identity.name
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
            username: identity.name!,
            profileImageUrl: identity.profileUrl,
        })


        return userId;
    }
})