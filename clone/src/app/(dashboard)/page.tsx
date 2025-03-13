"use client";

import { useConvexAuth, useMutation } from "convex/react";
// import { GigList } from "./_components/gig-list";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/router";

interface DashboardProps {
    searchParams: {
        search?: string;
        favourites?: string;
        filter?: string;
    }
    
};

const Dashboard = ({
    searchParams
}: DashboardProps) => {
    const store = useMutation(api.users.store);
    // save user if they aren't already saved in the db
    useEffect(() => {
        const storeUser = async () => {
            await store()
        }
        storeUser();
    }, [store])
    return (
        // <GigList query={searchParams} />
        <div>Hi</div>
    )
}

export default Dashboard;