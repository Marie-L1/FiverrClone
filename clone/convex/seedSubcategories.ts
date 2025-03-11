import {mutation, query} from "./_generated/server";

const subcategories = [
    "Frontend Development", "Backend Development", "Full Stack Development", 
    "Embedded Systems", "DevOps", "Cloud Computing", "Software Testing",

    "React Development", "Vue Development", "WordPress Development", "Shopify Development",
    "Web App Development", "Landing Page Development", "E-commerce Development", 
    
    "iOS App Development", "Android App Development", "Flutter Development",
    "React Native Development", "Game App Development", "AR/VR Apps", "Wearable App Development",
    
    "Wireframing", "Prototyping", "User Research", "UI/UX Audits", "App UI Design",
    "Web UI Design", "Usability Testing", 
    
    "Social Media Marketing", "SEO", "Email Marketing", "Content Marketing", 
    "Affiliate Marketing", "Influencer Marketing", "Growth Hacking", 
    
    "Logo Design", "Brand Strategy", "Corporate Identity", "Brand Guidelines", 
    "Naming & Slogans", "Personal Branding","Brand Messaging",
    
    "Machine Learning", "Data Analysis", "Data Visualization", "AI Model Development",
    "Big Data", "Data Cleaning", "Deep Learning",

    "Facebook Ads", "Google Ads", "SEO Optimization", "Email Campaigns",
    "Conversion Rate Optimization", "Growth Strategy", "Marketing Automation",

    "YouTube Editing", "Podcast Editing", "Motion Graphics", "Green Screen Editing",
    "Short-form Video Editing", "Wedding Video Editing", "Color Grading",
    
    "Blog Writing", "Copywriting", "Technical Writing","Ghostwriting",
    "Scriptwriting", "Resume Writing", "Proofreading & Editing",

    "Business Cards", "Infographics", "Illustrations", "Packaging Design", 
    "Brochure Design", "Banner Ads", "Flyer Design",
    
    "2D Animation", "3D Animation", "Explainer Videos", "Whiteboard Animation",
    "Character Animation", "Motion Graphics", "Stop Motion",
    
    "Corporate Videos", "Event Filming", "Music Videos", "Product Videos",
    "Drone Filming", "Interview Videos", "Commercials",
    
    "Beat Production", "Songwriting", "Mixing & Mastering", "Sound Effects",
    "Vocal Tuning", "Podcast Editing", "Jingle Creation",

    "Portrait Photography", "Product Photography", "Event Photography", "Real Estate Photography",
    "Fashion Photography", "Food Photography", "Photo Editing",
    
    "AI Chatbots", "Natural Language Processing", "Computer Vision", "AI Model Training",
    "AI Consulting", "AI Ethics", "AI API Development",
    
    "Unity Development", "Unreal Engine Development", "Mobile Game Development", "2D Game Design",
    "3D Game Design", "Game UI/UX", "Game Scripting"
  ];
  

  export const create = mutation({
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Unauthorized");
        }

        const categories = await ctx.db.query("categories").collect();
        const subcategoriesCheck = await ctx.db.query("subcategories").collect();

        if (subcategoriesCheck.length > 0) return;

        // flatMap flattens arrays
        await Promise.all(
            categories.flatMap((category, index) => {
                const categorySubcategories = subcategories.slice(index * 7, (index + 1) * 7);
                
                return categorySubcategories.map((subcategoryName) => {
                    return ctx.db.insert("subcategories", {
                        categoryId: category._id, 
                        name: subcategoryName
                    });
                });
            })
        );

        return;
    }
});
