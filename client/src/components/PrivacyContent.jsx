import React from "react"
import Section from "./Section.jsx"

function PrivacyContent() {
    return (
        <div>
            <Section title="What we collect" >
                Your name, username, email address and password (stored as a hash, never in
                plain text). If you upload an avatar, we store that file too. We also log
                basic activity like views, likes and comments so features like trending 
                posts and view counts work.
            </Section>
            <Section title="How we use it" >
                To run your account (logging in, verifying your email, resetting your 
                password), to show your posts and profile to others and to keep the 
                platform safe from abuse through rate limiting and moderation
            </Section>
            <Section title="What we don't do" >
                We don't sell your data to third parties. Your email is never shown publicly - 
                It's masked (like j***@gmail.com) anywhere it might appear during account recovery.
            </Section>
            <Section title="Cookies & sessions" >
                We use a sing secure, HTTP-only cookie to keep you signed in. It's used only
                for authentication, not for advertising or tracking across other sites.
            </Section>
            <Section title="Your choices" >
                You can update your profile information at any time and you can request your
                account be deleted. Some content may remain for a short window to allow
                reversal of moderation actions.
            </Section>
            <Section title="Contact" >
                Questions about your data or this policy can be sent to site's support
                mail id - jaison7373@gmail.com
            </Section>
        </div>
    )
}

export default PrivacyContent