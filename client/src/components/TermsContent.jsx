import React from "react"
import Section from "./Section.jsx"

function TermsContent() {
    return (
        <div>
            <Section title="1. Your account" >
                You're responsible for keeping your login details secure and for anything
                posted from your account. You need to be at least 13 years old to sign updated
                and the email or username your reigster with should be accurate
            </Section>
            <Section title="2. What you post" >
                You keep ownership of everything you write. By publishing a post or comment,
                you're giving us permission to display and distribute it on the platform so
                other people can read it. Don't post anything you don't have the right to score.
            </Section>
            <Section title="3. Acceptable use" >
                No harassment, hate speech, spam or content that's illegal or misleading.
                Reported posts are reviewed and we may remove content or suspend accounts 
                that break these rules.
            </Section>
            <Section title="4. Guest accounts" >
                Guest sessions are meant for trying the platform out. They aren't tied to a 
                verified email and may be limited or removed at anytime without notice.
            </Section>
            <Section title="5. Ending your account" >
                You can stop using the service at any time. We may suspend or remove accounts
                that violate these terms. Deleted content is retained for a short period for 
                moderation purposes before being permantly removed.
            </Section>
            <Section title="6. Changes to these terms" >
                We may update these terms as platform evolves. Continuing to use the site 
                after a change means you accept the updated terms.
            </Section>
        </div>
    )
}

export default TermsContent