export const DUMMY_POST = [
    {
        id: "post-1",
        author: { firstName: "Jaison", lastName: "David", username: "jd2007", avatarURL: null },
        publishedAt: "June 10, 2026",
        readTime: "5 min read",
        tag: "Technology",
        title: "Why React Server Components will Change Everything.",
        excerpt: 
            "Server Components let you render parts of your app on the server without shipping JavaScript to the client. Here's why that matters more than you might think \
            and how it changes the way we architect modern web apps.",
            likes: 142,
            comments: [
                {
                    id: "c1",
                    author: { firstName: "Suresh", lastName: "Kumar", username: "suresh_rocky", avatarURL: null },
                    text: "Great breakdown! The part about zero-bundle overhead really clicked for me.",
                    postedAt: "2h ago",
                },
                {
                    id: "c2",
                    author: { firstName: "Jasmine" , lastName: "J." , username:"jas_jasmine", avatarURL: null },
                    text: "Yeah Jaison david . it is a very informative blog . i loved it.",
                    postedAt: "1h ago",
                },
            ]
    },
    {
        id: "post-2",
        author: { firstName: "jagath", lastName: "guru", username: "jagath_999", avatarURL: null },
        publishedAt: "June 9, 2026",
        readTime: "Career",
        title: "From Junior to Senior: The mindset Shifts Nobody Talks About",
        excerpt:
            "Technical skills will only get you so far. The real leap from junior to senior developer is about ownership, communication \
            and learning to be comfortable with ambiguity. Here are the lessons that actually moved the needle for me.",
        likes: 89,
        comments: [
            {
                id: "c3",
                author: { firstName: "Modi", lastName: "Ji", username: "ji@modi", avatarURL: null },
                text: "The bit about ambiguity tolerance is so underrated. Wish someone told me thins earlier.",
                postedAt: "5h ago",
            },
        ],
    }
]